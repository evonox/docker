import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent, DOMMouseEvent } from "../framework/dom-events";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DetectionMode, DragAndDrop } from "../utils/DragAndDrop";
import { IState } from "../common/serialization";
import { IContextMenuAPI } from "../common/panel-api";
import { IPoint, IRect, ISize } from "../common/dimensions";
import { ContainerType } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { DragOverflowGuard, DragOverflowState, OverflowDirection } from "../utils/DragOverflowGuard";
import { MOUSE_BTN_LEFT } from "../common/constants";

export class DraggableContainer implements IDockContainer {

    private domEventMouseDown: DOMMouseEvent;
    private eventManager = new ComponentEventManager();

    private guardX: DragOverflowGuard = new DragOverflowGuard();
    private guardY: DragOverflowGuard = new DragOverflowGuard();

    constructor(private dockMananger: DockManager, private delegate: IDockContainer, private topElement: HTMLElement, private dragHandle: HTMLElement) {
        this.handleMouseDown = this.handleMouseDown.bind(this);

        this.domEventMouseDown = new DOMEvent<MouseEvent>(this.dragHandle);
        this.domEventMouseDown.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});
    }

    updateLayoutState(): void {
        this.delegate.updateLayoutState();
    }

    handleContextMenuAction(actionName: string): void {
        this.delegate.handleContextMenuAction(actionName);
    }
    
    updateContainerState(): void {
        return this.delegate.updateContainerState();
    }

    setHeaderVisibility(visible: boolean): void {
        this.delegate.setHeaderVisibility(visible);
    }

    queryLoadedSize(): ISize {
        return this.delegate.queryLoadedSize();
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        return this.delegate.onQueryContextMenu(config);
    }

    getMinimumChildNodeCount(): number {
        return this.delegate.getMinimumChildNodeCount();
    }

    isHidden(): boolean {
        return this.delegate.isHidden();
    }

    setActiveChild(container: IDockContainer): void {
        return this.delegate.setActiveChild(container);
    }

    saveState(state: IState): void {
        return this.delegate.saveState(state);
    }

    loadState(state: IState): void {
        return this.delegate.loadState(state);
    }

    removeDecorator() {
        this.domEventMouseDown.unbind();
    }

    private lastMousePosition: IPoint;
    private isDragAndDropTriggered: boolean;

    private handleMouseDown(event: MouseEvent) {
        if(event.button !== MOUSE_BTN_LEFT)
            return;

        this.isDragAndDropTriggered = false;
        this.lastMousePosition = {x: event.pageX, y: event.pageY};

        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this), 
            "pointer", () => {}, DetectionMode.withThreshold);
    }

    private handleMouseUp(event: MouseEvent) {
        this.stopDragging(event);
    }

    private startDragging(event: MouseEvent) {
        if(this.delegate.isHidden())
            return;

        this.guardX.reset();
        this.guardY.reset();

        this.eventManager.triggerEvent("onDraggableDragStart", event);
    }

    private stopDragging(event: MouseEvent) {
        this.eventManager.triggerEvent("onDraggableDragStop", event);
    }

    private handleMouseMove(event: MouseEvent) {
        event.preventDefault();

        if(! this.isDragAndDropTriggered) {
            this.isDragAndDropTriggered = true;
            this.startDragging(event);
        }

        let dx = event.pageX - this.lastMousePosition.x;
        let dy = event.pageY - this.lastMousePosition.y;

        [dx, dy] = this.constrainDialogInsideViewport(dx, dy, event);

        let overflowState = this.guardX.isInDragOverflow(event.pageX);
        if(overflowState === DragOverflowState.InOverflowState) {
            dx = 0;
        } else if(overflowState === DragOverflowState.OverflowStateTerminated) {
            dx = this.guardX.adjustDeltaAfterOverflow(dx, event.pageX);
            this.guardX.reset();
        }

        overflowState = this.guardY.isInDragOverflow(event.pageY);
        if(overflowState === DragOverflowState.InOverflowState) {
            dy = 0;
        } else if(overflowState === DragOverflowState.OverflowStateTerminated) {
            dy = this.guardY.adjustDeltaAfterOverflow(dy, event.pageY);
            this.guardY.reset();
        }


        this.performDrag(dx, dy);

        const domBounds = DOM.from(this.topElement).getBounds();
        this.eventManager.triggerEvent("onDraggableDragMove", {event, x: domBounds.left, y: domBounds.top});

        this.lastMousePosition = {x: event.pageX, y: event.pageY};
    }

    private performDrag(dx: number, dy: number) {
        const domBounds = DOM.from(this.topElement).getBounds();
        const x = domBounds.left + dx;
        const y = domBounds.top + dy;
        DOM.from(this.topElement).left(x).top(y);
    }

    // Check if the dragged dialog is inside DockerTS Viewport
    private constrainDialogInsideViewport(dx: number, dy: number, event: MouseEvent): [number, number] {
        const domBounds = DOM.from(this.topElement).getBounds();
        const domViewport = this.dockMananger.getContainerBoundingRect();
        // Compute current bounds
        const bounds: IRect = {
            x: domBounds.left + dx,
            y: domBounds.top + dy,
            w: domBounds.width,
            h: domBounds.height
        };
            
        // Left, right and bottom edge can hide the floating dialog only by half
        const middlePoint: IPoint = {
            x: bounds.x + bounds.w / 2,
            y: bounds.y + bounds.h / 2
        }
        // Constrain the bounds
        if(middlePoint.x < domViewport.left) {
            dx = domViewport.left - (domBounds.left + domBounds.width / 2);
            this.guardX.startDragOverflow(event.pageX, OverflowDirection.Decrementing);
        }
        if(middlePoint.x > domViewport.right) {
            dx = domViewport.right - (domBounds.left + domBounds.width / 2);
            this.guardX.startDragOverflow(event.pageX, OverflowDirection.Incrementing);
        }
        // Top edge must not be crossed
        if(bounds.y < domViewport.top) {
            dy = domViewport.top - domBounds.top;
            this.guardY.startDragOverflow(this.lastMousePosition.y + dy, OverflowDirection.Decrementing);
        }
        if(middlePoint.y > domViewport.bottom) {
            dy = domViewport.bottom - (domBounds.top + domBounds.height / 2);
            this.guardY.startDragOverflow(this.lastMousePosition.y + dy, OverflowDirection.Incrementing);
        }   

        return [dx, dy];
    }

    dispose(): void {
        this.removeDecorator();
        this.eventManager.disposeAll();

        this.delegate.dispose();
    }

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

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        this.delegate.performLayout(children, relayoutEvenIfEqual);
    }

    resize(width: number, height: number): void {
        this.delegate.resize(width, height);
    }

    getContainerType(): ContainerType {
        return this.delegate.getContainerType();
    }

    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        if(this.isDraggableContainerEvent(eventName)) {
            return this.eventManager.subscribe(eventName, handler);
        } else {
            return this.delegate.on(eventName, handler);
        }
    }

    off(eventName: string): void {
        if(this.isDraggableContainerEvent(eventName)) {
            this.eventManager.unsubscribeAll(eventName);
        } else {
            this.delegate.off(eventName);
        }
    }

    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        if(this.isDraggableContainerEvent(eventName)) {
            return this.eventManager.subscribeOnce(eventName, handler);
        } else {
            return this.delegate.once(eventName, handler);
        }
    }

    private isDraggableContainerEvent(eventName: string) {
        if(eventName.startsWith("onDraggable")) return true;
        else return false;
    }
}
