import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { OrientationKind } from "../common/enumerations";
import { DragOverflowGuard, DragOverflowState, OverflowDirection } from "../utils/DragOverflowGuard";

import "./SplitterBar.css";
import { SplitterPanel } from "./SplitterPanel";

export interface ResizedPayload {
    prev: IDockContainer;
    next: IDockContainer;
    prevSize: number;
    nextSize: number;
    performResize?: boolean;
}

/**
 * SplitterBar Component
 */
export class SplitterBar extends Component {

    private domBar: DOM<HTMLElement>;

    private lastPosX: number;
    private lastPosY: number;

    private overflowGuard = new DragOverflowGuard();

    constructor(
        private splitterPanel: SplitterPanel,
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

    protected onInitialized(): void {}

    protected onDisposed(): void {}

    //////

    protected onInitialRender(): HTMLElement {
        this.domBar = DOM.create("div")
            .addClass("DockerTS-SplitterBar")
            .addClass(
                this.orientation === OrientationKind.Row 
                    ? "DockerTS-SplitterBar--Row" 
                    : "DockerTS-SplitterBar--Column"
            ).cacheBounds(false);

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
        // If there is minimum widht size overflow, suppress dragging X
        if(this.splitterPanel.isMinWidthSizeOverflow())
            return;
        // Check the overflow guard
        const overflowState = this.overflowGuard.isInDragOverflow(event.pageX);
        if(overflowState === DragOverflowState.InOverflowState)
            return;
        if(overflowState === DragOverflowState.OverflowStateTerminated) {
            delta = this.overflowGuard.adjustDeltaAfterOverflow(delta, event.pageX);
            this.overflowGuard.reset();   
        }
        // Current Widths
        const prevWidth = this.splitterPanel.getContainerSize(this.prevContainer);
        const nextWidth = this.splitterPanel.getContainerSize(this.nextContainer);

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

        // Trigger Resize Event
        const payload: ResizedPayload = {
            prev: this.prevContainer, next: this.nextContainer,
            prevSize: newPrevWidth, nextSize: newNextWidth,
            performResize: true
        };

        this.triggerEvent("onResized", payload);
    }

    private processDraggingY(delta: number, event: MouseEvent) {
        // If there is minimum height overflow - suppress the dragging Y
        if(this.splitterPanel.isMinHeightSizeOverflow())
            return;
        // Check the overflow guard
        const overflowState = this.overflowGuard.isInDragOverflow(event.pageY);
        if(overflowState === DragOverflowState.InOverflowState)
            return;
        if(overflowState === DragOverflowState.OverflowStateTerminated) {
            delta = this.overflowGuard.adjustDeltaAfterOverflow(delta, event.pageY);
            this.overflowGuard.reset();   
        }
        // Current Heights
        const prevHeight = this.splitterPanel.getContainerSize(this.prevContainer);
        const nextHeight = this.splitterPanel.getContainerSize(this.nextContainer);
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
        const newPrevHeight = prevHeight  + delta;
        const newNextHeight = nextHeight  - delta;

        // Trigger Resize Event
        const payload: ResizedPayload = {
            prev: this.prevContainer, next: this.nextContainer,
            prevSize: newPrevHeight, nextSize: newNextHeight,
            performResize: true
        };

        this.triggerEvent("onResized", payload);
    }
}