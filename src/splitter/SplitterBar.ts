import { Component } from "../framework/Component";
import { IDockContainer, OrientationKind } from "../model/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";


export class SplitterBar extends Component {

    private domBar: DOM<HTMLElement>;

    private lastPosX: number;
    private lastPosY: number;

    constructor(
        private prevContainer: IDockContainer, 
        private nextContainer: IDockContainer,
        private orientation: OrientationKind
    ) {
        super();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domBar = DOM.create("div").addClass(
            this.orientation === OrientationKind.Row ? "splitbar-vertical" : "splitbar-horizontal"
        );

        this.bind(this.domBar.get(), "mousedown", this.handleMouseDown);

        return this.domBar.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private handleMouseDown(event: MouseEvent) {
        // TODO: DISABLE TEXT SELECTION
        // TODO: ATTACH BLOCKER INSIDE DRAG-AND-DROP

        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;

        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this));
    }

    private handleMouseMove(event: MouseEvent) {

        // SUSPEND LAYOUT IN BOTH CONTAINERS - WHY?

        const deltaX = event.pageX - this.lastPosX;
        const deltaY = event.pageY - this.lastPosY;

        this.processDragging(deltaX, deltaY);

        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;

        // RESUME LAYOUT IN BOTH CONTAINERS - WHY?

    }

    private handleMouseUp(event: MouseEvent) {
        // TODO: ENABLE TEXT SELECTION
        // TODO: DETACH BLOCKER INSIDE DRAG-AND-DROP
    }

    // TODO: PROCESS DRAGGING OFFSET DEBT WHEN MOVED OUTSIDE OF MINIMUM PANEL SIZE
    // TODO: PERFORM FURTHER REFACTORING
    private processDragging(dx: number, dy: number) {
        const prevContainerWidth = this.prevContainer.getWidth();
        const prevContainerHeight = this.prevContainer.getHeight();
        const nextContainerWidth = this.nextContainer.getWidth();
        const nextContainerHeight = this.nextContainer.getHeight();

        const prevContainerMinSize = this.orientation === OrientationKind.Row 
            ? this.prevContainer.getMinWidth() : this.prevContainer.getMinHeight();
        const nextContainerMinSize = this.orientation === OrientationKind.Row
            ? this.nextContainer.getMinWidth() : this.nextContainer.getMinHeight();


        const prevContainerSize = this.orientation === OrientationKind.Row 
            ? prevContainerWidth : prevContainerHeight;
        const nextContainerSize = this.orientation === OrientationKind.Row 
            ? nextContainerWidth : nextContainerHeight;
        const delta = this.orientation === OrientationKind.Row ? dx : dy;
        const newPrevContainerSize = prevContainerSize + delta;
        const newNextContainerSize = nextContainerSize - delta;

        if(newPrevContainerSize < prevContainerMinSize || newNextContainerSize < nextContainerMinSize) {
            // TODO: DO DELTA OFFSET DEBT COUNTING
        }
        else {
            if(this.orientation === OrientationKind.Row) {
                this.prevContainer.resize(newPrevContainerSize, prevContainerHeight);
                this.nextContainer.resize(newNextContainerSize, nextContainerHeight);
            } else {
                this.prevContainer.resize(prevContainerWidth, newPrevContainerSize);
                this.nextContainer.resize(nextContainerWidth, newNextContainerSize);
            }

            this.notifyGlobalResizeEvent();
        }
    }

    private notifyGlobalResizeEvent() {
        // TODO: HOW TO NOTIFY DOCK MANAGER TO PERFORM LAYOUTING BASED ON DRAGGING???
    }
}