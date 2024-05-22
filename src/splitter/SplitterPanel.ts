import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { SplitterBar } from "./SplitterBar";
import { OrientationKind } from "../common/enumerations";


export class SplitterPanel extends Component {

    private domRoot: DOM<HTMLElement>;
    private splitterBars: SplitterBar[] = [];

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        super();
        this.initializeComponent();
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {

    }

    setContainerRatio(container: IDockContainer, ratio: number) {

    }

    getRatios(): number[] {
        return [];
    }

    setRatios(ratios: number[]) {

    }

    resize(width: number, height: number) {

    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        this.removeFromDOM();

        for(let splitterBar of this.splitterBars) {
            splitterBar.dispose();
        }
        this.splitterBars = [];
    }

    protected onInitialRender(): HTMLElement {
        this.domRoot = DOM.create("div");
        this.constructSplitterDOMInternals();
        return this.domRoot.get();
    }

    protected onUpdate(element: HTMLElement): void {}


    private constructSplitterDOMInternals() {
        if(this.childContainers.length < 2)
            throw new Error("Splitter panel must contain at least 2 containers");

        let lastInsertedElement: HTMLElement = null;
        for(let i = 0; i < this.childContainers.length - 1; i++) {
            // Construct the new splitter bar
            const prevContainer = this.childContainers[i];
            const nextContainer = this.childContainers[i + 1]
            const splitterBar = new SplitterBar(prevContainer, nextContainer, this.orientation);
            this.splitterBars.push(splitterBar);



        }
    }

    private removeFromDOM() {

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
        return container.getDOM().parentElement.isSameNode(this.domRoot.get());
    }
}
