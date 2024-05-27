import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { ResizedPayload, SplitterBar } from "./SplitterBar";
import { OrientationKind } from "../common/enumerations";
import { ArrayUtils } from "../utils/ArrayUtils";

import "./SplitterPanel.css";
import { MathHelper } from "../utils/math-helper";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";

export class SplitterPanel extends Component {

    private domSplitterPanelWrapper: DOM<HTMLElement>;
    private domSplitterPanel: DOM<HTMLElement>;
    private splitterBars: SplitterBar[] = [];

    private containerSizes: number[] = [];

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        super();
        this.initializeComponent();
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

        this.removeFromDOM();
        this.childContainers = children;
        this.constructSplitterDOMInternals();
    }

    updateContainerState(): void {
        this.updateContainerSizes(1);
        this.childContainers.forEach(child => child.updateContainerState());
    }

    updateLayoutState(): void {
        this.recomputeContainerSizes();
        this.updateContainerSizes(1);

        this.childContainers.forEach(child => child.updateLayoutState());       
    }


    setContainerRatio(container: IDockContainer, ratio: number) {
        const index = this.childContainers.indexOf(container);
        if(index < 0)
            throw new Error("ERROR: Container is not member of splitter panel");

        if(this.containerSizes.length === 0) {
            this.computeInitialSize();
        }

        const ratios = this.getRatios();
        ratios[index] = ratio;
        for(let i = 0; i < ratios.length; i++) {
            if(index !== i) {
                ratios[i] = (1 - ratio) / (ratios.length - 1);
            }
        }
        console.log("setContainerRatio");
        console.dir(ratios);

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

        console.log("setRatios");
        console.log(contentSize);

        // Recompute and apply changes
        this.containerSizes = ratios.map(ratio => ratio * contentSize);
        console.dir(this.containerSizes);
        this.updateContainerSizes(1);
    }

    private handleResizeEvent(payload: ResizedPayload) {
        const prevIndex = this.childContainers.indexOf(payload.prev);
        const nextIndex = this.childContainers.indexOf(payload.next);

        console.log("handleResizeEvent");
        console.dir(payload.prevSize);
        console.dir(payload.nextSize);;
        console.dir(payload.prevSize + payload.nextSize);

        this.containerSizes[prevIndex] = payload.prevSize;
        this.containerSizes[nextIndex] = payload.nextSize;

        this.updateContainerSizes(1);
    }

    private recomputeContainerSizes() {
        // Compute old content size
        let oldContentSize = MathHelper.sum(this.containerSizes);

        // Compute new content size
        let totalSize = this.getVaryingSize(this.domSplitterPanel);
        let barSize = this.splitterBars[0].getBarSize();
        let newContentSize = totalSize - (barSize * this.splitterBars.length);

        // Recompute the sizes
        const ratios = this.containerSizes.map(value => value / oldContentSize);
        this.containerSizes = ratios.map(value => value * newContentSize);
    }

    private updateContainerSizes(decimalPlaces: number) {
        // Compute rounded sizes of container sizes
        let totalSize = MathHelper.round(this.getVaryingSize(this.domSplitterPanel), decimalPlaces);
        let barSize = MathHelper.round(this.splitterBars[0].getBarSize(), decimalPlaces);
        let contentSize = totalSize - (barSize * this.splitterBars.length);

        console.log("updateContainerSize");
        console.dir([totalSize, barSize, contentSize]);

        let sizes = this.containerSizes.map(value => {
            console.log("INDEX");
            console.dir(value);
            return MathHelper.round(value, decimalPlaces);
        });

        sizes = [...this.containerSizes];

        console.dir(this.containerSizes);
        console.dir(sizes);

        // Correct the rounding error
        console.log(MathHelper.sum(sizes));
        let roundingError = contentSize - MathHelper.sum(sizes);
        console.dir(roundingError);

        for(let i = 0; i < sizes.length; i++) {
            sizes[i] += roundingError / sizes.length;
        }

        // Compute the CSS property value
        let propertyValueParts: string[] = [];
        for(let i = 0; i < sizes.length; i++) {
            if(i > 0) {
                propertyValueParts.push(barSize.toFixed(decimalPlaces) + "px");
            }
            propertyValueParts.push(sizes[i].toFixed(decimalPlaces) + "px");
        }
        const propertyValue = propertyValueParts.join(" ");

        // Apply the CSS property value
        this.domSplitterPanel.css("--docker-ratio-mapping", propertyValue);
    }

    resize(width: number, height: number) {
        if(this.childContainers.length <= 1)
            return;
        // this.recomputeContainerSizes();
        // this.updateContainerSizes(1);

        // // Set the container dimension
        // this.domSplitterPanel.width(width).height(height);

        // Adjust the fixed non-varying dimension
        // for(let i = 0; i < this.childContainers.length; i++) {
        //     const childContainer = this.childContainers[i];

        //     if(this.orientation === OrientationKind.Row) {
        //         childContainer.resize(childContainer.getWidth(), height);
        //     } else {
        //         childContainer.resize(width, childContainer.getHeight());
        //     }

        //     if(i < this.splitterBars.length) {
        //         const fixedDimension = this.orientation === OrientationKind.Row ? height : width;
        //         this.splitterBars[i].adjustFixedDimension(fixedDimension);
        //     }            
        // }

        // // Adjust the varying dimension
        // let totalChildPanelSize = 0;
        // this.childContainers.forEach(container => {
        //     const varyingSize = this.orientation === OrientationKind.Row ? 
        //         container.getWidth() : container.getHeight();
        //     totalChildPanelSize += varyingSize;
        // });


        // // Compute the scale multiplier as ratio between requried and available space
        // const barSize = this.splitterBars[0].getBarSize();
        // const targetTotalPanelSize = this.getVaryingSize(this.domSplitterPanel)
        //     - barSize * (this.childContainers.length - 1);
        // totalChildPanelSize = Math.max(totalChildPanelSize, 1);
        // const scaleMultiplier = targetTotalPanelSize / totalChildPanelSize;

        // Adjust the varying size accordingly
        // let totalNewSize = 0;
        // for(let i = 0; i < this.childContainers.length; i++) {
        //     const childContainer = this.childContainers[i];
        //     const originalSize = this.getVaryingSize(childContainer.getDOM());
        //     const newSize = Math.floor(originalSize * scaleMultiplier);
            
        //     totalNewSize += newSize;


        //     this.changeContainerVaryingSize(childContainer, newSize);
        // }
    }

    private changeContainerVaryingSize(container: IDockContainer, size: number) {
        if(this.orientation === OrientationKind.Row) {
            container.resize(size, container.getHeight());
        } else {
            container.resize(container.getWidth(), size);
        }
    }

    computeInitialSize() {
        const count = this.childContainers.length;
        const ratios = new Array(count).fill(1 / count);
        this.setRatios(ratios);
    }

    private getSplitPanelSize() {
        const barSize = this.splitterBars[0].getBarSize();
        const size = this.getVaryingSize(this.domSplitterPanel);
        return size - (this.childContainers.length - 1) * barSize;
    }

    private getVaryingSize(element: DOM<HTMLElement> | HTMLElement) {
        if(element instanceof HTMLElement) {
            element = DOM.from(element);
        }
        return this.orientation === OrientationKind.Row ? element.getWidth() : element.getHeight();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.removeFromDOM();
    }

    protected onInitialRender(): HTMLElement {
        this.domSplitterPanelWrapper = DOM.create("div").addClass("DockerTS-SplitterPanelWrapper");
        this.domSplitterPanel = DOM.create("div").addClass("DockerTS-SplitterPanel")
            .addClass(
                this.orientation === OrientationKind.Row 
                ? "DockerTS-SplitterPanel--Row" : "DockerTS-SplitterPanel--Column"
            ).appendTo(this.domSplitterPanelWrapper);
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
            //this.domSplitterPanel.appendChild(prevContainer.getDOM());
            this.domSplitterPanel.appendChild(splitterBar.getDOM());
        }

        //this.domSplitterPanel.appendChild(ArrayUtils.lastElement(this.childContainers).getDOM());
        this.appendContainerToSplitter(ArrayUtils.lastElement(this.childContainers));

        this.childContainers.forEach(container => {
            container.setHeaderVisibility(true);
            container.setVisible(true);
        });
    }

    private appendContainerToSplitter(container: IDockContainer) {
        const domContainer = container.getDOM();
        this.domSplitterPanel.appendChild(domContainer);
    }

    private removeFromDOM() {
        this.childContainers.forEach(container => {
            const domContainerElement = container.getDOM();
            DOM.from(domContainerElement)
                .removeClass("splitter-container-vertical")
                .removeClass("splitter-container-horizontal")
                .removeFromDOM();
        });

        this.splitterBars.forEach(bar => bar.dispose());
        this.splitterBars = [];
    }

    private insertContainerIntoSplitterPanel(container: IDockContainer, insertBeforeElement?: HTMLElement) {
        const domContainerElement = container.getDOM();

        if(this.isContainerAlreadyInserted(container)) {
            const domRootElement = this.getDOM();
            domContainerElement.remove();
            if(insertBeforeElement !== undefined) {
                domRootElement.insertBefore(domContainerElement, insertBeforeElement.nextSibling);
            } else {
                if(domContainerElement.children.length > 0) {
                    domRootElement.insertBefore(domContainerElement, domRootElement.firstElementChild);
                } else {
                    domRootElement.appendChild(domContainerElement);
                }
            }
        } 

        DOM.from(domContainerElement).addClass(
            this.orientation === OrientationKind.Row ? "splitter-container-horizontal" : "splitter-container-vertical"
        )
    }

    private isContainerAlreadyInserted(container: IDockContainer) {
        return container.getDOM().parentElement.isSameNode(this.domSplitterPanel.get());
    }
}
