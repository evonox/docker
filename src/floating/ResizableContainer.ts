import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { ResizeHandle, ResizeHandleType } from "./ResizeHandle";
import { IState } from "../common/serialization";
import { IContextMenuAPI } from "../common/panel-api";
import { IDeltaRect, IPoint, IRect, ISize } from "../common/dimensions";
import { ContainerType } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { EventHelper } from "../utils/event-helper";
import { DragOverflowGuard, DragOverflowState, OverflowDirection } from "../utils/DragOverflowGuard";
import { RectHelper } from "../utils/rect-helper";

/**
 * Container Decorator providing the resizing functionality
 * 
 * Events:
 *      onDialogResized - notification that the dialog has been resized
 */
export class ResizableContainer implements IDockContainer {

    private resizeHandles: ResizeHandle[] = [];
    private eventManager = new ComponentEventManager();
    private subscriptionResizeEnable: ComponentEventSubscription;

    private dragOverflowGuardX: DragOverflowGuard = new DragOverflowGuard();
    private dragOverflowGuardY: DragOverflowGuard = new DragOverflowGuard();

    private isResizeEnabled: boolean = true;

    constructor(
        private dockManager: DockManager,
        private delegate: IDockContainer, 
        private topElement: HTMLElement,
    ) {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.buildResizeHandles();
        this.subscriptionResizeEnable = this.delegate.on("onEnableResize", isEnabled => {
            this.toggleResizeHandles(isEnabled);
        });
    }

    /**
     *  Pure Decorator Overrides passing control to the delegated container
     */

    handleContextMenuAction(actionName: string): void {
        this.delegate.handleContextMenuAction(actionName);
    }

    isHidden(): boolean {
        return this.delegate.isHidden();
    }

    setHeaderVisibility(visible: boolean): void {
        this.delegate.setHeaderVisibility(visible);
    }
    
    queryLoadedSize(): ISize {
        return this.delegate.queryLoadedSize();
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        this.delegate.onQueryContextMenu(config);
    }

    getMinimumChildNodeCount(): number {
        return this.delegate.getMinimumChildNodeCount();
    }

    getChildContainers(): IDockContainer[] {
        return this.delegate.getChildContainers();
    }

    setActiveChild(container: IDockContainer): void {
        this.delegate.setActiveChild(container);
    }

    saveState(state: IState): void {
        this.delegate.saveState(state);
    }

    loadState(state: IState): void {
        this.delegate.loadState(state);
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        this.delegate.performLayout(children, relayoutEvenIfEqual);
    }

    dispose() {
        this.removeDecorator();
        this.eventManager.disposeAll();
    }

    removeDecorator() {
        this.subscriptionResizeEnable.unsubscribe();
        this.destroyResizeHandles();
    }

    updateState() {
        this.delegate.updateState();
        this.adjustResizeHandleZIndexes();
    }

    updateLayout(rect?: IRect): void {
        this.delegate.updateLayout(rect);
    }

    /**
     * Construct & Destroy Resizing Handles Logic 
     */

    private toggleResizeHandles(isEnabled: boolean) {
        if(this.isResizeEnabled !== isEnabled) {
            this.isResizeEnabled = isEnabled;
            if(isEnabled) {
                this.buildResizeHandles();
            } else {
                this.destroyResizeHandles();
            }
        }
    }

    private buildResizeHandles() {
        // Apply size of corner and handle size from the configuraton
        const handleSize = this.dockManager.config.dialogResizeHandleThickness;
        const cornerSize = this.dockManager.config.dialogResizeHandleCornerSize;
        DOM.from(this.topElement).css("--docker-ts-resize-handle-size", `${handleSize}px`)
            .css("--docker-ts-corner-handle-size", `${cornerSize}px`);

        // Build the Resize Handles
        this.buildResizeHandle({north: true, south: false, west: false, east: false});
        this.buildResizeHandle({north: false, south: true, west: false, east: false});
        this.buildResizeHandle({north: false, south: false, west: true, east: false});
        this.buildResizeHandle({north: false, south: false, west: false, east: true});

        // Note: we omit the creation of NorthEast Resize Handle - it might interfere with header buttons
        this.buildResizeHandle({north: true, south: false, west: true, east: false});
        this.buildResizeHandle({north: false, south: true, west: true, east: false});
        this.buildResizeHandle({north: false, south: true, west: false, east: true});

        // Adjust zIndexes due to TabbedPanelContainer
        this.adjustResizeHandleZIndexes();
    }

    private buildResizeHandle(kind: ResizeHandleType) {
        const resizeHandle = new ResizeHandle(kind);
        this.topElement.appendChild(resizeHandle.getDOM());
        this.resizeHandles.push(resizeHandle);

        resizeHandle.on("onMouseDown", this.handleMouseDown);
    }

    private destroyResizeHandles() {
        for(const resizeHandle of this.resizeHandles) {
            resizeHandle.dispose();
        }
        this.resizeHandles = [];
    }

    private adjustResizeHandleZIndexes() {
        // const zIndex = DOM.from(this.topElement).getZIndex();
        // this.resizeHandles.forEach(handle => handle.adjustZIndex(zIndex + 3));
    }

    /**
     * Drag-and-drop Functionality for resizing the dialog
     */

    private lastMousePos: IPoint;
    private draggedHandle: ResizeHandle;

    private handleMouseDown(payload: any) {
        const { handle, event } = payload;
        if(this.isResizeEnabled === false) {
            EventHelper.suppressEvent(event);
            return;
        }

        this.draggedHandle = handle;
        this.lastMousePos = {x: event.pageX, y: event.pageY};

        this.dragOverflowGuardX.reset();
        this.dragOverflowGuardY.reset();

        DragAndDrop.start(event, 
            this.handleMouseMove.bind(this), 
            this.handleMouseUp.bind(this), 
            handle.getCursor()
        );
    }

    private handleMouseMove(event: MouseEvent) {
        const dx = event.pageX - this.lastMousePos.x;
        const dy = event.pageY - this.lastMousePos.y;

        this.performDrag(this.draggedHandle, {x: event.pageX, y: event.pageY}, dx, dy);

        this.lastMousePos = {x: event.pageX, y: event.pageY};
    }

    private handleMouseUp(event: MouseEvent) {
        delete this.lastMousePos;
        delete this.draggedHandle;
    }

    private performDrag(handle: ResizeHandle, currentPos: IPoint, dx: number, dy: number) {
        let rect = DOM.from(this.topElement).getBoundsRect();
        rect.w = this.delegate.getWidth();
        rect.h = this.delegate.getHeight();

        this.checkedX = false;
        this.checkedY = false;

        if(handle.north()) rect = this.resizeNorth(currentPos, dy, rect);
        if(handle.south()) rect = this.resizeSouth(currentPos, dy, rect);
        if(handle.west()) rect = this.resizeWest(currentPos, dx, rect);
        if(handle.east()) rect = this.resizeEast(currentPos, dx, rect);

        this.eventManager.triggerEvent("onDialogResized", rect);
    }

    private resizeNorth(currentPos: IPoint, delta: number, bounds: IRect) {
        return this.resizeContainer(currentPos, bounds, {dx: 0, dy: delta, dw: 0, dh: -delta});
    }

    private resizeSouth(currentPos: IPoint, delta: number, bounds: IRect) {
        return this.resizeContainer(currentPos, bounds, {dx: 0, dy: 0, dw: 0, dh: delta});       
    }

    private resizeEast(currentPos: IPoint, delta: number, bounds: IRect) {
        return this.resizeContainer(currentPos, bounds, {dx: 0, dy: 0, dw: delta, dh: 0});             
    }

    private resizeWest(currentPos: IPoint, delta: number, bounds: IRect) {
        return this.resizeContainer(currentPos, bounds, {dx: delta, dy: 0, dw: -delta, dh: 0});             
    }

    private resizeContainer(currentPos: IPoint, bounds: IRect, delta: IDeltaRect): IRect {

        this.constrainByDragOverflows(currentPos, {...bounds}, delta);
        this.constrainContainerRect(currentPos, {...bounds}, delta);
        
        bounds = RectHelper.appendDelta(bounds, delta);
        return bounds;
    }

    private checkedX: boolean = false;
    private checkedY: boolean = false;

    private constrainByDragOverflows(currentPos: IPoint, bounds: IRect, delta: IDeltaRect)  {
        if(delta.dw !== 0) {
            const overflowStateX = this.dragOverflowGuardX.isInDragOverflow(currentPos.x);
            if(overflowStateX === DragOverflowState.InOverflowState) {
                delta.dw = 0;
                delta.dx = 0;
                this.checkedX = true;
            } else if(overflowStateX === DragOverflowState.OverflowStateTerminated) {
                if(this.dragOverflowGuardX.getOverflowDirection() === OverflowDirection.Decrementing) {
                    delta.dw = this.dragOverflowGuardX.adjustDeltaAfterOverflow(delta.dw, currentPos.x);
                } else {
                    delta.dx = this.dragOverflowGuardX.adjustDeltaAfterOverflow(delta.dx, currentPos.x);
                    delta.dw = - delta.dx;
                }
                this.dragOverflowGuardX.reset();
                this.checkedX = true;
            }   
        }

        if(delta.dh !== 0) {
            const overflowStateY = this.dragOverflowGuardY.isInDragOverflow(currentPos.y);
            if(overflowStateY === DragOverflowState.InOverflowState) {
                delta.dh = 0;
                delta.dy = 0;
                this.checkedY = true;
            } else if(overflowStateY === DragOverflowState.OverflowStateTerminated) {
                if(this.dragOverflowGuardY.getOverflowDirection() === OverflowDirection.Decrementing) {
                    delta.dh = this.dragOverflowGuardY.adjustDeltaAfterOverflow(delta.dh, currentPos.y);
                } else {
                    delta.dy = this.dragOverflowGuardY.adjustDeltaAfterOverflow(delta.dy, currentPos.y);
                    delta.dh = - delta.dy;
                }
                this.dragOverflowGuardY.reset();
                this.checkedY = true;
            }   
        }
    }

    private constrainContainerRect(currentPos: IPoint, bounds: IRect, delta: IDeltaRect) {
        const newBounds = RectHelper.appendDelta(bounds, delta);
        const minWidth = this.delegate.getMinWidth();
        const minHeight = this.delegate.getMinHeight();
        if(newBounds.w < minWidth && this.checkedX === false) {
            delta.dw = minWidth - bounds.w;
            if(delta.dx !== 0) {
                delta.dx = - delta.dw;
            }

            const direction = currentPos.x > this.lastMousePos.x ? OverflowDirection.Incrementing : OverflowDirection.Decrementing;
            const guardedCoordinate = direction === OverflowDirection.Decrementing ? 
                this.lastMousePos.x + delta.dw : this.lastMousePos.x + delta.dx;
            this.dragOverflowGuardX.startDragOverflow(guardedCoordinate, direction);
        }
        if(newBounds.h < minHeight && this.checkedY === false) {
            delta.dh = minHeight - bounds.h;
            if(delta.dy !== 0) {
                delta.dy = - delta.dh;
            }

            const direction = currentPos.y > this.lastMousePos.y ? OverflowDirection.Incrementing : OverflowDirection.Decrementing;
            const guardedCoordinate = direction === OverflowDirection.Decrementing ? 
                this.lastMousePos.y + delta.dh : this.lastMousePos.y + delta.dy;
            this.dragOverflowGuardY.startDragOverflow(guardedCoordinate, direction);
        }
    }

    /**
     *  Pure Decorator Overrides passing control to the delegated container
     */

    getDOM(): HTMLElement {
        return this.delegate.getDOM();
    }

    hasChanges(): boolean {
        return this.delegate.hasChanges();
    }

    setVisible(visible: boolean): void {
        this.delegate.setVisible(visible);
    }

    getMinWidth(): number {
        return this.delegate.getMinWidth();
    }

    getMinHeight(): number {
        return this.delegate.getMinHeight();
    }

    getWidth(): number {
        return this.delegate.getWidth();
    }

    getHeight(): number {
        return this.delegate.getHeight();
    }

    resize(rect: IRect): void {
        this.delegate.resize(rect);
    }

    getContainerType(): ContainerType {
        return this.delegate.getContainerType();
    }

    /**
     * Event Emitter Overrides - differentiate between delegated and internal events for the decorator
     */

    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        if(this.isInternalEvent(eventName) === false) {
            return this.delegate.on(eventName, handler);
        } else {
            return this.eventManager.subscribe(eventName, handler);
        }
    }

    off(eventName: string): void {
        if(this.isInternalEvent(eventName) === false) {
            this.delegate.off(eventName);
        } else {
            this.eventManager.unsubscribeAll(eventName);
        }
    }

    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        if(this.isInternalEvent(eventName) === false) {
            return this.delegate.once(eventName, handler);
        } else {
            return this.eventManager.subscribeOnce(eventName, handler);
        }
    }

    private isInternalEvent(eventName: string) {
        return eventName === "onDialogResized";
    }
}
