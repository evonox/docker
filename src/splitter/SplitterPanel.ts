import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { ResizedPayload, SplitterBar } from "./SplitterBar";
import { OrientationKind } from "../common/enumerations";
import { ArrayUtils } from "../utils/ArrayUtils";

import "./SplitterPanel.css";
import { MathHelper } from "../utils/math-helper";
import { IRect } from "../common/dimensions";
import { RectHelper } from "../utils/rect-helper";
import { DOMRegistry } from "../utils/DOMRegistry";

export class SplitterPanel extends Component {

    private domSplitterPanelWrapper: DOM<HTMLElement>;
    private domSplitterPanel: DOM<HTMLElement>;
    private splitterBars: SplitterBar[] = [];

    private containerSizes: number[] = [];

    private splitterPanelRO: ResizeObserver;

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        super();
        this.initializeComponent();
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.removeFromDOM();
    }

    protected onInitialRender(): HTMLElement {
        this.domSplitterPanelWrapper = DOM.create("div")
            .addClass("DockerTS-SplitterPanelWrapper")
            .cacheBounds(false);
        this.domSplitterPanel = DOM.create("div").addClass("DockerTS-SplitterPanel")
            .addClass(
                this.orientation === OrientationKind.Row 
                ? "DockerTS-SplitterPanel--Row" : "DockerTS-SplitterPanel--Column"
            ).appendTo(this.domSplitterPanelWrapper).cacheBounds(false);

        this.constructSplitterDOMInternals();

        return this.domSplitterPanelWrapper.get();
    }

    protected onUpdate(element: HTMLElement): void {}


    private constructSplitterDOMInternals() {
        if(this.childContainers.length < 2)
            throw new Error("Splitter panel must contain at least 2 containers");

        // TODO: DIFF LOGIC TO MAKE IT FASTER???
        for(let i = 0; i < this.childContainers.length - 1; i++) {
            // Construct the new splitter bar
            const prevContainer = this.childContainers[i];
            const nextContainer = this.childContainers[i + 1]
            const splitterBar = new SplitterBar(this, prevContainer, nextContainer, this.orientation);
            splitterBar.on("onResized", this.handleResizeEvent.bind(this));
            this.splitterBars.push(splitterBar);

            this.appendContainerToSplitter(prevContainer);
            this.domSplitterPanel.appendChild(splitterBar.getDOM());
        }

        this.appendContainerToSplitter(ArrayUtils.lastElement(this.childContainers));

        this.childContainers.forEach(container => {
            container.setHeaderVisibility(true);
            container.setVisible(true);
        });

        this.computeInitialSize();

        if(this.splitterPanelRO === undefined) {
            this.splitterPanelRO = new ResizeObserver(() => {
                this.adjustContainerSizesToNewDimensions();
            });
            this.splitterPanelRO.observe(this.domSplitterPanel.get());
        }
    }

    private appendContainerToSplitter(container: IDockContainer) {
        const domContainer = container.getDOM();
        this.domSplitterPanel.appendChild(domContainer);
    }

    private removeFromDOM() {
        this.splitterPanelRO?.disconnect();
        this.splitterPanelRO = undefined;

        this.childContainers.forEach(container => {
            const domContainerElement = container.getDOM();
            if(DOMRegistry.existsDOM(domContainerElement)) {
                DOM.from(domContainerElement).removeFromDOM();
            }
        });

        this.splitterBars.forEach(bar => bar.dispose());
        this.splitterBars = [];
        this.containerSizes = [];
    }

    /**
     * SplitterPanel Public API
     */

    getTotalBarSize() {
        return this.splitterBars[0].getBarSize() * this.splitterBars.length;
    }

    getContainerSize(container: IDockContainer) {
        const index = this.childContainers.indexOf(container);
        return this.containerSizes[index];
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        const isContainerEqual = ArrayUtils.isArrayEqual(children, this.childContainers);
        if(isContainerEqual && ! relayoutEvenIfEqual)
            return;

        children.forEach(child => child.setHeaderVisibility(true));

        let previousSizes = [...this.containerSizes];
        if(children.length !== this.childContainers.length ) {
            previousSizes = undefined;
        }

        this.removeFromDOM();
        this.childContainers = children;
        this.constructSplitterDOMInternals(); 

        if(previousSizes !== undefined) {
            this.containerSizes = previousSizes;
            this.applyChildContainerSizes();   
        }

        this.invalidate();
    }

    updateContainerState(): void {
        this.childContainers.forEach(child => child.updateContainerState());
    }

    updateLayoutState(): void {
        this.childContainers.forEach(child => child.updateLayoutState());       
    }

    setContainerRatio(container: IDockContainer, ratio: number) {
        const index = this.childContainers.indexOf(container);
        if(index < 0)
            throw new Error("ERROR: Container is not member of splitter panel");

        console.log("---- SET CONTAINER RATIO ----");

        const ratios = this.getRatios();
        ratios[index] = ratio;
        for(let i = 0; i < ratios.length; i++) {
            if(index !== i) {
                ratios[i] = (1 - ratio) / (ratios.length - 1);
            }
        }

        this.setRatios(ratios);
    }

    getRatios(): number[] {
        // Compute new content size
        let totalSize = this.getVaryingSize(this.domSplitterPanel);
        let barSize = this.splitterBars[0].getBarSize();
        let contentSize = totalSize - (barSize * this.splitterBars.length);

        return this.containerSizes.map(size => size / contentSize);
    }

    setRatios(ratios: number[]) {
        // Compute new content size
        let totalSize = this.getVaryingSize(this.domSplitterPanel);
        let barSize = this.splitterBars[0].getBarSize();
        let contentSize = totalSize - (barSize * this.splitterBars.length);

        // Recompute and apply changes
        this.containerSizes = ratios.map(ratio => ratio * contentSize);

        this.applyChildContainerSizes();
        // this.triggerChildContainerResize();
    }

    resize(rect: IRect) {
        return;
        if(this.childContainers.length <= 1)
            return;
        this.domSplitterPanel.applySize(rect);

        this.recomputeContainerSizes(rect);
        this.applyChildContainerSizes();
        this.triggerChildContainerResize();
    }

    invalidate() {
        const bounds = this.domSplitterPanel.getBoundsRect();
        this.resize(bounds);
    }

    /**
     * Resize-computing private methods
     */

    private handleResizeEvent(payload: ResizedPayload) {
        const prevIndex = this.childContainers.indexOf(payload.prev);
        const nextIndex = this.childContainers.indexOf(payload.next);

        this.containerSizes[prevIndex] = payload.prevSize;
        this.containerSizes[nextIndex] = payload.nextSize;

        this.applyChildContainerSizes();
    }

    private adjustContainerSizesToNewDimensions() {
        const splitterBounds = this.domSplitterPanel.getBoundsRect();
        this.recomputeContainerSizes(splitterBounds);
    }

    private recomputeContainerSizes(rect: IRect) {
        if(RectHelper.isSizeOnly(rect)) {
            rect.x = this.domSplitterPanel.getLeft();
            rect.y = this.domSplitterPanel.getTop();
        }       

        let totalChildPanelSize = MathHelper.sum(this.containerSizes);

        // Compute the scale multiplier as ratio between requried and available space
        const barSize = this.splitterBars[0].getBarSize();
        const targetTotalPanelSize = this.getVaryingSize(this.domSplitterPanel)
            - barSize * (this.childContainers.length - 1);
        totalChildPanelSize = Math.max(totalChildPanelSize, 1);
        const scaleMultiplier = targetTotalPanelSize / totalChildPanelSize;

        // Adjust the varying size accordingly
        for(let i = 0; i < this.childContainers.length; i++) {
            const originalSize = this.containerSizes[i];
            const newSize = originalSize * scaleMultiplier;
            this.containerSizes[i] = newSize;
        }
    }

    private applyChildContainerSizes() {
        // Compute rounded sizes of container sizes
        let barSize = this.splitterBars[0].getBarSize();            
        let sizes = [...this.containerSizes];

        const totalChildPanelSize = MathHelper.sum(sizes);
        const barSizeRemainder = this.computeSplitterBarSizeRemainder();

        // Compute the CSS property value
        let propertyValueParts: string[] = [];
        for(let i = 0; i < sizes.length; i++) {
            if(i > 0) {
                propertyValueParts.push(MathHelper.toPX(barSize));
            }
            const ratio = sizes[i] / totalChildPanelSize * 100;
            let cssPropertyValue = `calc(${ratio.toFixed(5)}% - ${barSizeRemainder})`
            propertyValueParts.push(cssPropertyValue);
        }
        const propertyValue = propertyValueParts.join(" ");

        // Apply the CSS property value
        this.domSplitterPanel.css("--docker-splitter-panel-sizing", propertyValue);
    }

    private computeSplitterBarSizeRemainder() {
        const barSize = this.splitterBars[0].getBarSize();
        const barCount = this.splitterBars.length;
        const barSizeTotal = barSize * barCount
        return MathHelper.toPX(barSizeTotal / (barCount + 1));
    }

    private triggerChildContainerResize() {
        // Note: we take the non-varying dimension from the splitter panel than container itself
        // Reason: rounding errors
        const splitterBounds = this.domSplitterPanel.getBoundsRect();
        const barSize = this.splitterBars[0].getBarSize();
        let varyingDim = 0;
        for(let i = 0; i < this.childContainers.length; i++) {
            const childContainer = this.childContainers[i];
            const size = this.containerSizes[i];

            let childRect: IRect;
            const containerBounds = DOM.from(childContainer.getDOM()).getBoundingClientRect();
            if(this.orientation === OrientationKind.Row) {
                childRect = RectHelper.from(
                    MathHelper.roundToPX(varyingDim), containerBounds.y, MathHelper.roundToPX(size), splitterBounds.h);
            } else if(this.orientation === OrientationKind.Column) {
                childRect = RectHelper.from(containerBounds.x, varyingDim, splitterBounds.w, size);
            }
            childContainer.resize(childRect);

            varyingDim += size + barSize;
        }
    }

    private computeInitialSize() {
        if(this.containerSizes.length === 0) {
            const count = this.childContainers.length;
            const ratios = new Array(count).fill(1 / count);
            this.setRatios(ratios);   
        }
    }

    private getVaryingSize(element: DOM<HTMLElement> | HTMLElement) {
        if(element instanceof HTMLElement) {
            element = DOM.from(element);
        }
        return this.orientation === OrientationKind.Row ? element.getWidth() : element.getHeight();
    }
}
