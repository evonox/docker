import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent, DOMMouseEvent } from "../framework/dom-events";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { IState } from "../common/serialization";
import { IContextMenuAPI } from "../common/panel-api";
import { IPoint, ISize } from "../common/dimensions";
import { ContainerType } from "../common/enumerations";


export class DraggableContainer implements IDockContainer {

    private domEventMouseDown: DOMMouseEvent;
    private eventManager = new ComponentEventManager();

    constructor(private delegate: IDockContainer, private topElement: HTMLElement, private dragHandle: HTMLElement) {
        this.handleMouseDown = this.handleMouseDown.bind(this);

        this.domEventMouseDown = new DOMEvent<MouseEvent>(this.dragHandle);
        this.domEventMouseDown.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});

        // // Note: will this be needed?
        // const domBounds = DOM.from(this.topElement).getBounds();
        // DOM.from(this.topElement)
        //     .css("left", domBounds.left.toFixed(3) + "px")
        //     .css("top", domBounds.top.toFixed(3) + "px");
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

    private handleMouseDown(event: MouseEvent) {
        this.lastMousePosition = {x: event.pageX, y: event.pageY};
        this.startDragging(event);
        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this));
    }

    private lastMousePosition: IPoint;

    private handleMouseUp(event: MouseEvent) {
        this.stopDragging(event);
    }

    private startDragging(event: MouseEvent) {
        DOM.from(this.delegate.getDOM()).addClass("draggable-dragging-active");
        this.eventManager.triggerEvent("onDraggableDragStart", event);
        // TODO: SOME OTHER STUFF
    }

    private stopDragging(event: MouseEvent) {
        this.eventManager.triggerEvent("onDraggableDragStop", event);
        DOM.from(this.delegate.getDOM()).removeClass("draggable-dragging-active");
    }

    private handleMouseMove(event: MouseEvent) {
        event.preventDefault();
        const dx = event.pageX - this.lastMousePosition.x;
        const dy = event.pageY - this.lastMousePosition.y;

        // TODO: CHECK THE BOUNDS USING DOCKER MANAGER

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
