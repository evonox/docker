import { IDockContainer } from "../common/declarations";
import { OrientationKind } from "../common/enumerations";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { DragOverflowGuard, DragOverflowState, OverflowDirection } from "../utils/DragOverflowGuard";

import "./SplitterBar.css";
import { SplitterPanelBase } from "./SplitterPanelBase";

export interface ResizedPayload {
    prev: IDockContainer;
    next: IDockContainer;
    prevSize: number;
    nextSize: number;
}

/**
 * SplitterBar Component
 */
export abstract class SplitterBarBase extends Component {

    protected domBar: DOM<HTMLElement>;

    protected lastPosX: number;
    protected lastPosY: number;

    protected overflowGuard = new DragOverflowGuard();

    constructor(
        protected splitterPanel: SplitterPanelBase,
        private prevContainer: IDockContainer,
        private nextContainer: IDockContainer,
    ) {
        super();
        this.initializeComponent();
    }

    /**
     * Public API
     */

    public abstract getBarSize();

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void { }
    protected onDisposed(): void { }

    protected onInitialRender(): HTMLElement {
        this.domBar = DOM.create("div")
            .addClass("DockerTS-SplitterBar")
            .addClass(this.getSplitterBarCSSClass())
            .cacheBounds(false);

        this.bind(this.domBar.get(), "mousedown", this.handleMouseDown);
        return this.domBar.get();
    }

    protected onUpdate(element: HTMLElement): void { }

    /**
     * Abstract Methods to Override
     */

    protected abstract getOrientation(): OrientationKind;
    protected abstract getSplitterBarCSSClass(): string;
    protected abstract getResizeMouseCursor(): string;

    protected abstract isVaryingDimMinimumOverflow(): boolean;
    protected abstract getLastVaryingCoordinate(): number;
    protected abstract getVaryingCoordinate(event: MouseEvent): number;
    protected abstract getMinimumContainerSize(container: IDockContainer): number;

    /**
     * Drag-And-Drop Handlers
     */

    private handleMouseDown(event: MouseEvent) {
        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;

        this.overflowGuard.reset();

        const mouseCursor = this.getResizeMouseCursor();
        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this), mouseCursor);
    }

    private handleMouseMove(event: MouseEvent) {
        const deltaX = event.pageX - this.lastPosX;
        const deltaY = event.pageY - this.lastPosY;

        const delta = this.getOrientation() === OrientationKind.Row ? deltaX : deltaY;
        this.processDragging(delta, event);

        this.lastPosX = event.pageX;
        this.lastPosY = event.pageY;
    }

    private handleMouseUp(event: MouseEvent) {
        this.overflowGuard.reset();
    }

    /**
     * Main Dragging Method
     */

    private processDragging(delta: number, event: MouseEvent) {
        // If there is minimum varying dimension overflow - suppress the dragging
        if (this.isVaryingDimMinimumOverflow())
            return;

        // Check the overflow guard - if we are behind allowed min size
        const lastVaryingCoord = this.getLastVaryingCoordinate();
        const varyingCoord = this.getVaryingCoordinate(event);
        const overflowState = this.overflowGuard.isInDragOverflow(varyingCoord);
        if(overflowState === DragOverflowState.InOverflowState)
            return;
        if(overflowState === DragOverflowState.OverflowStateTerminated) {
            delta = this.overflowGuard.adjustDeltaAfterOverflow(delta, varyingCoord);
            this.overflowGuard.reset();   
        }

        // Get Current Varying Dimensions
        const prevSize = this.splitterPanel.getContainerSize(this.prevContainer);
        const nextSize = this.splitterPanel.getContainerSize(this.nextContainer);

        // Minimum Allowed Dimensions of Containers
        const prevMinSize = this.getMinimumContainerSize(this.prevContainer);
        const nextMinSize = this.getMinimumContainerSize(this.nextContainer);

        // Check boundaries of minimum dimensions
        if(prevSize + delta < prevMinSize) {
            delta = prevMinSize - prevSize;
            const guardCoordinate = lastVaryingCoord + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Decrementing);
        }
        else if(nextSize - delta < nextMinSize) {
            delta = nextMinSize - nextSize;
            const guardCoordinate = lastVaryingCoord + delta;
            this.overflowGuard.startDragOverflow(guardCoordinate, OverflowDirection.Incrementing);
        }        

        // Compute the new sizes
        const newPrevSize = prevSize  + delta;
        const newNextSize = nextSize  - delta;

        // Prepare the event payload
        const payload: ResizedPayload = {
            prev: this.prevContainer, next: this.nextContainer,
            prevSize: newPrevSize, nextSize: newNextSize,
        };

        // Trigger Resize Event
        this.triggerEvent("onResized", payload);
    }
}
