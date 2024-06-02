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
import { MOUSE_BTN_LEFT } from "../common/constants";
import { AnimationHelper } from "../utils/animation-helper";

export class DraggableContainer implements IDockContainer {

    private domEventMouseDown: DOMMouseEvent;
    private eventManager = new ComponentEventManager();

    private dockDragStart: ComponentEventSubscription;
    private dockDragMove: ComponentEventSubscription;
    private dockDragStop: ComponentEventSubscription;

    constructor(private dockMananger: DockManager, private delegate: IDockContainer, private topElement: HTMLElement, private dragHandle: HTMLElement) {
        this.handleMouseDown = this.handleMouseDown.bind(this);

        this.domEventMouseDown = new DOMEvent<MouseEvent>(this.dragHandle);
        this.domEventMouseDown.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});

        this.dockDragStart = this.delegate.on("onDockingDragStart", event => {
            this.isDragAndDropTriggered = true;
            this.lastMousePosition = {x: event.pageX, y: event.pageY};
            this.startDragging(event);
        });
        this.dockDragMove = this.delegate.on("onDockingDragMove", event => this.handleMouseMove(event));
        this.dockDragStop = this.delegate.on("onDockingDragStop", event => this.handleMouseUp(event));
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

        this.eventManager.triggerEvent("onDraggableDragStart", event);
    }

    private async stopDragging(event: MouseEvent) {
        const [correctX, correctY] = this.computeDialogPositionInsideViewport();
        const bounds = this.topElement.getBoundingClientRect();
        if(Math.abs(bounds.x - correctX) > 1 || Math.abs(bounds.y - correctY) > 1) {
            await AnimationHelper.animateDialogMove(this.topElement, correctX, correctY, () => {
                const bounds = this.topElement.getBoundingClientRect();
                this.eventManager.triggerEvent("onDraggableDragMove", {event, x: bounds.x, y: bounds.y});
            });

        }
        DOM.from(this.topElement).left(correctX).top(correctY);
        this.eventManager.triggerEvent("onDraggableDragMove", {event, x: correctX, y: correctY});

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

        const domBounds = DOM.from(this.topElement).getBoundsRect();
        domBounds.x += dx;
        domBounds.y += dy;
        this.eventManager.triggerEvent("onDraggableDragMove", {event, x: domBounds.x, y: domBounds.y});

        this.lastMousePosition = {x: event.pageX, y: event.pageY};
    }

    // Check if the dragged dialog is inside DockerTS Viewport
    private computeDialogPositionInsideViewport(): [number, number] {
        const bounds = DOM.from(this.topElement).getBoundsRect();
        const domViewport = this.dockMananger.getContainerBoundingRect();
            
        // Left, right and bottom edge can hide the floating dialog only by half
        const middlePoint: IPoint = {
            x: bounds.x + bounds.w / 2,
            y: bounds.y + bounds.h / 2
        }
        let x = bounds.x, y = bounds.y;
        // Constrain the bounds
        if(middlePoint.x < domViewport.left) {
            x = domViewport.left - (bounds.w / 2);
        }
        if(middlePoint.x > domViewport.right) {
            x = domViewport.right - (bounds.w / 2);
        }
        // Top edge must not be crossed
        if(bounds.y < domViewport.top) {
            y = domViewport.top - 0;
        }
        if(middlePoint.y > domViewport.bottom) {
            y = domViewport.bottom - (bounds.h / 2);
        }   

        return [x, y];
    }

    dispose(): void {
        this.removeDecorator();

        this.dockDragStart.unsubscribe();
        this.dockDragMove.unsubscribe();
        this.dockDragStop.unsubscribe();
        this.eventManager.disposeAll();
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

    resize(rect: IRect): void {
        this.delegate.resize(rect);
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
