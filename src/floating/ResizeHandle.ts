import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { queryResizeMouseCursor } from "./resizing-mouse-cursors";

import "./ResizeHandle.css";

export interface ResizeHandleType {
    north: boolean;
    south: boolean;
    west: boolean;
    east: boolean;
}

/**
 * Invisible Handle floating over the Dialog Frame to trigger resizing when activated
 * 
 * Events:
 *      onMouseDown - event to trigger the resize operation
 */
export class ResizeHandle extends Component {

    private domHandle: DOM<HTMLElement>;

    constructor(private handleType: ResizeHandleType) {
        super();
        this.initializeComponent();
    }

    getCursor() {
        return queryResizeMouseCursor(this);
    }

    adjustZIndex(zIndex: number) {
        this.domHandle.zIndex(zIndex);
    }

    north() { return this.handleType.north; }
    south() { return this.handleType.south; }
    east() { return this.handleType.east; }
    west() { return this.handleType.west; }

    protected onInitialized(): void {}
    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domHandle = DOM.create("div").addClass("DockerTS-ResizeHandle");
        this.updateHandleCssClass();
        
        this.bind(this.domHandle.get(), "mousedown", this.handleMouseDown);

        return this.domHandle.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private handleMouseDown(event: MouseEvent) {
        this.triggerEvent("onMouseDown", {event, handle: this});
    }

    private updateHandleCssClass() {
        if(this.isCornerHandle()) {
            this.updateCornerHandle();
        } else {
            this.updateBorderHandle();
        }
    }

    private updateBorderHandle() {
        if(this.handleType.north) {
            this.domHandle.addClass("ResizeHandler--North");
        } else if(this.handleType.south) {
            this.domHandle.addClass("ResizeHandler--South");
        } else if(this.handleType.east) {
            this.domHandle.addClass("ResizeHandler--East");           
        } else if(this.handleType.west) {
            this.domHandle.addClass("ResizeHandler--West");
        }
    }

    private updateCornerHandle() {
        if(this.handleType.north) {
            if(this.handleType.east) {
                this.domHandle.addClass("ResizeHandler--NorthEast");
            } else if(this.handleType.west) {
                this.domHandle.addClass("ResizeHandler--NorthWest");
            }
        } else if(this.handleType.south)  {
            if(this.handleType.east) {
                this.domHandle.addClass("ResizeHandler--SouthEast");
            } else if(this.handleType.west) {
                this.domHandle.addClass("ResizeHandler--SouthWest");
            }
        }
    }

    private isCornerHandle() {
        return (this.handleType.north && this.handleType.east) ||
                (this.handleType.north && this.handleType.west) ||
                (this.handleType.south && this.handleType.west) ||
                (this.handleType.south && this.handleType.east);
    }
}
