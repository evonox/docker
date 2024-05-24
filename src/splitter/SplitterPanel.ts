import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { ResizedPayload, SplitterBar } from "./SplitterBar";
import { OrientationKind } from "../common/enumerations";
import { ArrayUtils } from "../utils/ArrayUtils";

import "./SplitterPanel.css";

export class SplitterPanel extends Component {

    private domSplitterPanel: DOM<HTMLElement>;
    private splitterBars: SplitterBar[] = [];

    private ratios: number[] = [];

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        super();
        this.initializeComponent();
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        const isContainerEqual = ArrayUtils.isArrayEqual(children, this.childContainers);
        if(isContainerEqual && ! relayoutEvenIfEqual)
            return;
        
        children.forEach(child => child.setHeaderVisibility(true));

        this.removeFromDOM();
        this.childContainers = children;
        this.constructSplitterDOMInternals();

        this.deriveRatiosFromContentSize();
        this.applyRatios();   
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

        const oldRatios = this.getRatios();
        const remainingSpaceFactor = (1 - ratio);

        const newRatios: number[] = []
        for(let i = 0; i < oldRatios.length; i++) {
            if(i === index) {
                newRatios.push(ratio);
            } else {
                newRatios.push(oldRatios[i] * remainingSpaceFactor);
            }
        }

        this.setRatios(newRatios);
    }

    getRatios(): number[] {
        return [...this.ratios];
        // const panelSize = this.getSplitPanelSize();
        // const results = [];
        // for(const container of this.childContainers) {
        //     const childSize = this.getVaryingSize(container.getDOM());
        //     results.push(childSize / panelSize);
        // }
        // return results;
    }

    setRatios(ratios: number[]) {
        this.ratios = [...ratios];
        this.applyRatios();
        // const panelSize = this.getSplitPanelSize();
        // for(let i = 0; i < ratios.length; i++) {
        //     const container = this.childContainers[i];
        //     const size = ratios[i] * panelSize;
        //     this.changeContainerVaryingSize(container, size);
        // }
    }

    private handleResizeEvent(payload: ResizedPayload) {
        console.dir(payload);
        this.recalcRatioBySize(payload.prev, payload.prevSize);
        this.recalcRatioBySize(payload.next, payload.nextSize);
        this.applyRatios();
    }

    private recalcRatioBySize(container: IDockContainer, size: number) {
        const index = this.childContainers.indexOf(container);
        const totalSize = this.getVaryingSize(this.domSplitterPanel);
        this.ratios[index] = size / totalSize;
    }

    private deriveRatiosFromContentSize() {
        const totalSize = this.getVaryingSize(this.domSplitterPanel);
        this.ratios = [];
        for(const container of this.childContainers) {
            const size = this.orientation === OrientationKind.Row ? container.getWidth() : container.getHeight();
            this.ratios.push(size / totalSize);
        }
    }

    private applyRatios() {
        // TODO: CACHE THIS COMPUTATION
        const barCount = this.splitterBars.length;
        const barSize = this.splitterBars[0].getBarSize();
        const barSizePx = `${barSize.toFixed(3)}px`
        const totalBarSize = barSize * barCount;
        const totalBarSizePx = `${totalBarSize.toFixed(3)}px`;

        const barSizeDecrement = `calc(${totalBarSizePx} / ${barCount + 1} * ${barCount})`;

        let ratioMappings: string[] = [];
        for(let i = 0; i < this.ratios.length; i++) {
            if(i > 0) {
                ratioMappings.push(barSizePx);
            }
            const ratio = this.ratios[i];            
            const ratioMapping = `calc( ${(ratio * 100).toFixed(3)}% - ${barSizeDecrement})`;
            ratioMappings.push(ratioMapping);
        }
        
        const ratioMappingPropertyValue = ratioMappings.join(" ");
        this.domSplitterPanel.css("--docker-ratio-mapping", ratioMappingPropertyValue);
    }

    resize(width: number, height: number) {
        if(this.childContainers.length <= 1)
            return;
        this.applyRatios();

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
        this.domSplitterPanel = DOM.create("div").addClass("DockerTS-SplitterPanel")
            .addClass(this.orientation === OrientationKind.Row ? "DockerTS-SplitterPanel--Row" : "DockerTS-SplitterPanel--Column");
        this.constructSplitterDOMInternals();

        this.deriveRatiosFromContentSize();
        this.applyRatios();   

        return this.domSplitterPanel.get();
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
            const splitterBar = new SplitterBar(prevContainer, nextContainer, this.orientation);
            splitterBar.on("onResized", this.handleResizeEvent.bind(this));
            this.splitterBars.push(splitterBar);

            this.domSplitterPanel.appendChild(prevContainer.getDOM());
            this.domSplitterPanel.appendChild(splitterBar.getDOM());
        }

        this.domSplitterPanel.appendChild(ArrayUtils.lastElement(this.childContainers).getDOM());
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
