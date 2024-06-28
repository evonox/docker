import { OrientationKind } from "../common/enumerations";
import { IDockContainer } from "../common/declarations";
import { IRect } from "../common/dimensions";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { MathHelper } from "../utils/math-helper";
import { ResizedPayload } from "./SplitterBarBase";
import { SplitterBarBase } from "./SplitterBarBase";
import { RectHelper } from "../utils/rect-helper";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DOMRegistry } from "../utils/DOMRegistry";

import "./SplitterPanel.css";

/**
 * Base Class for the Splitter Panel
 */
export abstract class SplitterPanelBase extends Component {

    // SplitterPanel DOM Elements
    protected domSplitterPanelWrapper: DOM<HTMLElement>;
    protected domSplitterPanel: DOM<HTMLElement>;    
    // Splitter Bar Components
    private splitterBars: SplitterBarBase[] = [];
    // Actual Sizes of the containers in PX
    protected containerSizes: number[] = [];

    constructor(protected childContainers: IDockContainer[]) {
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
                this.getOrientation() === OrientationKind.Row 
                ? "DockerTS-SplitterPanel--Row" : "DockerTS-SplitterPanel--Column"
            ).appendTo(this.domSplitterPanelWrapper).cacheBounds(false);

        this.constructSplitterDOMInternals();
        this.updateSplitterPanelLayout();

        return this.domSplitterPanelWrapper.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    /**
     * Construct & Dispose Logic
     */

    private constructSplitterDOMInternals() {
        if(this.childContainers.length < 2)
            throw new Error("Splitter panel must contain at least 2 containers");

        for(let i = 0; i < this.childContainers.length - 1; i++) {
            const prevContainer = this.childContainers[i];
            const nextContainer = this.childContainers[i + 1]
            const splitterBar = this.createSplitterBar(prevContainer, nextContainer);            
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

        this.distributeContainerSizesEvenly();
    }

    private appendContainerToSplitter(container: IDockContainer) {
        const domContainer = container.getDOM();
        this.domSplitterPanel.appendChild(domContainer);
    }

    private removeFromDOM() {
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

    protected abstract createSplitterBar(prevContainer: IDockContainer, nextContainer: IDockContainer): SplitterBarBase;

    /**
     * Splitter Panel Public API
     */

    getTotalBarSize(): number {
        return this.computeTotalPanelBarSize();
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
        }

        this.updateSplitterPanelLayout();
    }

    updateState() {
        this.childContainers.forEach(child => child.updateState());
    }

    setContainerRatio(container: IDockContainer, ratio: number) {
        // Get the index of ratio
        const index = this.childContainers.indexOf(container);
        if(index < 0)
            throw new Error("ERROR: Container is not member of splitter panel");

        // Set the container ratio
        const ratios = this.getRatios();
        ratios[index] = ratio;

        // Distribute the ratio of remaining panels evenly
        for(let i = 0; i < ratios.length; i++) {
            if(index !== i) {
                ratios[i] = (1 - ratio) / (ratios.length - 1);
            }
        }
        // Do the update
        this.setRatios(ratios);
    }

    getContainerRatio(container: IDockContainer): number {
        const index = this.childContainers.indexOf(container);
        if(index < 0)
            throw new Error("ERROR: Container is not member of splitter panel");
        const ratios = this.getRatios();
        return ratios[index];
    }

    getRatios(): number[] {
        const childContainerSize = this.getElementVaryingSize(this.domSplitterPanel) 
            - this.computeTotalPanelBarSize();
        return this.containerSizes.map(size => size / childContainerSize);
    }

    setRatios(ratios: number[]) {
        const childContainerSize = this.getElementVaryingSize(this.domSplitterPanel) 
            - this.computeTotalPanelBarSize();
        this.containerSizes = ratios.map(ratio => ratio * childContainerSize);
        this.updateSplitterPanelLayout();
    }

    resize(rect: IRect) {
        if(this.childContainers.length <= 1)
            return;
        this.recomputeContainerSizesToNewDimensions(rect);
        this.updateSplitterPanelLayout();
    }

    private updateSplitterPanelLayout() {
        // Check minimum size constraints
        if(this.isMinimumSizeOverflow()) {
            this.adjustContainerSizesIfMinimumSizeOverflows();
        } else {
            this.adjustContainerSizesToTheirMinimumSize();
        }
        // Apply the sizing to CSS
        this.applyContainerSizesToCSS();
        // Notify the child containers about the layout change
        this.notifyChildContainersLayoutChanged();
    }

    /**
     * Event Handler Methods
     */

    private handleResizeEvent(payload: ResizedPayload) {
        const prevIndex = this.childContainers.indexOf(payload.prev);
        const nextIndex = this.childContainers.indexOf(payload.next);
        this.containerSizes[prevIndex] = payload.prevSize;
        this.containerSizes[nextIndex] = payload.nextSize;

        this.applyContainerSizesToCSS();
        this.notifyChildContainersLayoutChanged();
    }

    /**
     * Resize-Computation Helper Methods & Algorithms
     */

    private recomputeContainerSizesToNewDimensions(rect: IRect) {
        let totalChildPanelSize = MathHelper.sum(this.containerSizes);
        // Compute the scale multiplier as ratio between requried and available space
        const targetTotalPanelSize = this.getElementVaryingSize(this.domSplitterPanel)
            - this.computeTotalPanelBarSize();
        totalChildPanelSize = Math.max(totalChildPanelSize, 1);
        const scaleMultiplier = targetTotalPanelSize / totalChildPanelSize;

        // Adjust the varying size accordingly
        for(let i = 0; i < this.childContainers.length; i++) {
            const originalSize = this.containerSizes[i];
            const newSize = originalSize * scaleMultiplier;
            this.containerSizes[i] = newSize;
        }
    }

    private applyContainerSizesToCSS() {
        // Compute rounded sizes of container sizes
        let barSize = this.splitterBars[0].getBarSize();            
        let containerSizes = [...this.containerSizes];

        // Get total sizes
        const totalChildPanelSize = MathHelper.sum(containerSizes);
        const barSizeRemainder = MathHelper.toPX(this.computeSplitterBarSizeRemainder());

        // Compute the CSS property value
        let propertyValueParts: string[] = [];
        for(let i = 0; i < containerSizes.length; i++) {
            if(i > 0) {
                propertyValueParts.push(MathHelper.toPX(barSize));
            }
            const containerRatio = containerSizes[i] / totalChildPanelSize * 100;
            let cssPropertyValue = `calc(${containerRatio.toFixed(5)}% - ${barSizeRemainder})`
            propertyValueParts.push(cssPropertyValue);
        }
        const propertyValue = propertyValueParts.join(" ");

        // Apply the CSS property value
        this.domSplitterPanel.css("--docker-splitter-panel-sizing", propertyValue);
    }

    private computeTotalPanelBarSize(): number {
        const splitterBarSize = this.splitterBars[0].getBarSize();
        const splitterBarCount = this.splitterBars.length;
        return splitterBarSize * splitterBarCount
    }

    private computeSplitterBarSizeRemainder() {
        const splitterBarCount = this.splitterBars.length;
        const splitterBarSizeTotal = this.computeTotalPanelBarSize();
        return MathHelper.roundToPX(splitterBarSizeTotal / (splitterBarCount + 1));
    }

    private notifyChildContainersLayoutChanged() {
        // Note: we take the non-varying dimension from the splitter panel than container itself
        // Reason: rounding errors        
        const splitterBounds = this.domSplitterPanel.getBoundsRect();
        const barSize = this.splitterBars[0].getBarSize();
        const orientation = this.getOrientation();

        let varyingDimOffset = orientation === OrientationKind.Row ? splitterBounds.x : splitterBounds.y
        for(let i = 0; i < this.childContainers.length; i++) {
            const childContainer = this.childContainers[i];
            const containerSize = this.containerSizes[i];

            let childRect: IRect;
            if(orientation === OrientationKind.Row) {                
                childRect = RectHelper.from(
                    MathHelper.roundToPX(varyingDimOffset), splitterBounds.y, 
                    MathHelper.roundToPX(containerSize), splitterBounds.h
                );
            } else if(orientation === OrientationKind.Column) {
                childRect = RectHelper.from(
                    splitterBounds.x, MathHelper.roundToPX(varyingDimOffset), 
                    splitterBounds.w, MathHelper.roundToPX(containerSize)
                );
            }
            childContainer.updateLayout(childRect);

            varyingDimOffset += containerSize + barSize;
        }
    }

    private adjustContainerSizesIfMinimumSizeOverflows() {
        // Get minimum required & avialable size
        const requiredMinimumSize = this.getTotalMinimumRequiredSize();
        const availableMinimumSize = this.getElementVaryingSize(this.domSplitterPanel);
        const scalingFactor = availableMinimumSize / requiredMinimumSize;

        // Scale the container space evenly according to the minimum sizes
        for(let i = 0; i < this.containerSizes.length; i++) {            
            // Get the child container and recompute the new sizes proportionally to the minimum size
            const childContainer = this.childContainers[i];
            const minimumSize = this.getContainerMinimumSize(childContainer);
            const sizeRatio = minimumSize / requiredMinimumSize * scalingFactor;
            this.containerSizes[i] = sizeRatio * availableMinimumSize;
        }
    }

    private adjustContainerSizesToTheirMinimumSize() {
        // Check if the size of container is smaller than its requried minimum size
        const wasMinimumSizeSet = new Array(this.childContainers.length).fill(false);
        for(let i = 0; i < this.childContainers.length; i++) {
            const childContainer = this.childContainers[i];
            const minSize = this.getContainerMinimumSize(childContainer);
            if(minSize > this.containerSizes[i]) {
                this.containerSizes[i] = minSize;
                wasMinimumSizeSet[i] = true;
            }
        }
        // Check if to any element was set the minimum size
        const wasSetAnyMinimumSize = wasMinimumSizeSet.reduce((prev, curr) => prev || curr, false);
        if(! wasSetAnyMinimumSize)
            return;

        // Compute the overflow space for containers that were not set the minimum size
        const totalContainerSize = MathHelper.sum(this.containerSizes);
        const availableSize = this.getElementVaryingSize(this.domSplitterPanel);
        const remainderOverflownSize = totalContainerSize - availableSize;
        const sizeOfNonMinimumContainers = MathHelper.sum(
            this.childContainers
                .filter((child, index) => wasMinimumSizeSet[index] === false)
                .map((child, index) => this.containerSizes[index])
        );

        // Distribute the overflow size among containers that do not have the minimum size
        for(let i = 0; i < this.containerSizes.length; i++) {
            if(wasMinimumSizeSet[i])
                continue;
            const ratio = this.containerSizes[i] / sizeOfNonMinimumContainers;
            const distributedOverflowRemainder = ratio * remainderOverflownSize;
            this.containerSizes[i] -= distributedOverflowRemainder;
        }
    }

    private distributeContainerSizesEvenly() {
        const containerCount = this.childContainers.length;
        const varyingSize = this.getElementVaryingSize(this.domSplitterPanel) 
            - this.computeSplitterBarSizeRemainder();
        this.containerSizes = new Array(containerCount).fill(varyingSize / containerCount);
    }

    /**
     * Helper Metrics Methods & Other Overriden Abstract Methods
     */

    public abstract getOrientation(): OrientationKind;
    public abstract isMinimumSizeOverflow(): boolean;
    protected abstract getTotalMinimumRequiredSize(): number;  
    protected abstract getContainerMinimumSize(childContainer: IDockContainer): number
    protected abstract getElementVaryingSize(element: DOM<HTMLElement> | HTMLElement): number;
}
