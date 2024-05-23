import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { OrientationKind } from "../common/enumerations";
import { DragOverflowGuard, DragOverflowState, OverflowDirection } from "../utils/DragOverflowGuard";

import "./SplitterBar.css";

/**
 * SplitterBar Component
 */
export class SplitterBar extends Component {

    private domBar: DOM<HTMLElement>;

    private lastPosX: number;
    private lastPosY: number;

    private overflowGuard = new DragOverflowGuard();

    constructor(
        private prevContainer: IDockContainer, 
        private nextContainer: IDockContainer,
        private orientation: OrientationKind
    ) {
        super();
        this.initializeComponent();
    }

    getBarSize() {
        return this.orientation === OrientationKind.Row ? this.domBar.getWidth() : this.domBar.getHeight();
    }

    adjustFixedDimension(size: number) {
        if(this.orientation === OrientationKind.Row) {
            this.domBar.height(size);
        } else {
            this.domBar.width(size);
        }
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domBar = DOM.create("div")
            .addClass("DockerTS-SplitterBar")
            .addClass(
                this.orientation === OrientationKind.Row 
                    ? "DockerTS-SplitterBar--Row" 
                    : "DockerTS-SplitterBar--Column"
            );

        this.bind(this.domBar.get(), "mousedown", this.handleMouseDown);
        return this.domBar.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private handleMouseDown(event: MouseEvent) {
        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;

        this.overflowGuard.reset();

        const mouseCursor = this.orientation === OrientationKind.Row ? "col-resize" : "row-resize";
        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this), mouseCursor);
    }

    private handleMouseMove(event: MouseEvent) {
        const deltaX = event.pageX - this.lastPosX;
        const deltaY = event.pageY - this.lastPosY;

        if(this.orientation === OrientationKind.Row) {
            this.processDraggingX(deltaX, event);
        } else {
            this.processDraggingY(deltaY, event);
        }

        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;
    }

    private handleMouseUp(event: MouseEvent) {
        this.overflowGuard.reset();
    }

    private processDraggingX(delta: number, event: MouseEvent) {
        // Check the overflow guard
        const overflowState = this.overflowGuard.isInDragOverflow(event.pageX);
        if(overflowState === DragOverflowState.InOverflowState)
            return;
        if(overflowState === DragOverflowState.OverflowStateTerminated) {
            delta = this.overflowGuard.adjustDeltaAfterOverflow(delta, event.pageX);
            this.overflowGuard.reset();   
        }
        // Current Widths
        const prevWidth = this.prevContainer.getWidth();
        const nextWidth = this.nextContainer.getWidth();
        // Minimum Allowed Widths
        const prevMinWidth = this.prevContainer.getMinWidth();
        const nextMinWidth = this.nextContainer.getMinWidth();
        // Check boundaries of minimum widths
        if(prevWidth + delta < prevMinWidth) {
            delta = prevMinWidth - prevWidth;
            const guardCoordinate = this.lastPosX + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Decrementing);
        }
        else if(nextWidth - delta < nextMinWidth) {
            delta = nextMinWidth - nextWidth;
            const guardCoordinate = this.lastPosX + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Incrementing);
        }        
        // New Widths
        const newPrevWidth = prevWidth + delta;
        const newNextWidth = nextWidth - delta;
        // Resize the containers
        this.prevContainer.resize(newPrevWidth, this.prevContainer.getHeight());
        this.nextContainer.resize(newNextWidth, this.nextContainer.getHeight());
    }

    private processDraggingY(delta: number, event: MouseEvent) {
        // Check the overflow guard
        const overflowState = this.overflowGuard.isInDragOverflow(event.pageY);
        if(overflowState === DragOverflowState.InOverflowState)
            return;
        if(overflowState === DragOverflowState.OverflowStateTerminated) {
            delta = this.overflowGuard.adjustDeltaAfterOverflow(delta, event.pageY);
            this.overflowGuard.reset();   
        }
        // Current Heights
        const prevHeight = this.prevContainer.getHeight();
        const nextHeight = this.nextContainer.getHeight();
        // Minimum Allowed Heights
        const prevMinHeight = this.prevContainer.getMinHeight();
        const nextMinHeight = this.nextContainer.getMinHeight();
        // Check boundaries of minimum heights
        if(prevHeight + delta < prevMinHeight) {
            delta = prevMinHeight - prevHeight;
            const guardCoordinate = this.lastPosY + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Decrementing);
        }
        else if(nextHeight - delta < nextMinHeight) {
            delta = nextMinHeight - nextHeight;
            const guardCoordinate = this.lastPosY + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Incrementing);
        }        
        // New Heights
        const newPrevHeight = prevHeight + delta;
        const newNextHeight = nextHeight - delta;
        // Resize the containers
        this.prevContainer.resize(this.prevContainer.getWidth(), newPrevHeight);
        this.nextContainer.resize(this.nextContainer.getWidth(), newNextHeight);
    }

    private notifyGlobalResizeEvent() {
        // TODO: HOW TO NOTIFY DOCK MANAGER TO PERFORM LAYOUTING BASED ON DRAGGING???
    }
}