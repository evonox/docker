import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent, DOMMouseEvent } from "../framework/dom-events";
import { ContainerType, IDockContainer, IPoint } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { IState } from "../common/serialization";


export class DraggableContainer implements IDockContainer {

    private domEventMouseDown: DOMMouseEvent;

    constructor(private delegate: IDockContainer, private topElement: HTMLElement, private dragHandle: HTMLElement) {
        this.handleMouseDown = this.handleMouseDown.bind(this);

        this.domEventMouseDown = new DOMEvent<MouseEvent>(this.dragHandle);
        this.domEventMouseDown.bind("mousedown", this.handleMouseDown, {capture: false});

        // Note: will this be needed?
        const domBounds = DOM.from(this.topElement).getBounds();
        DOM.from(this.topElement)
            .css("left", domBounds.left.toFixed(3) + "px")
            .css("top", domBounds.top.toFixed(3) + "px");
    }
    getMinimumChildNodeCount(): number {
        throw new Error("Method not implemented.");
    }
    setActiveChild(container: IDockContainer): void {
        throw new Error("Method not implemented.");
    }
    saveState(state: IState): void {
        throw new Error("Method not implemented.");
    }
    loadState(state: IState): void {
        throw new Error("Method not implemented.");
    }

    removeDecorator() {
        this.domEventMouseDown.unbind();
    }

    private handleMouseDown(event: MouseEvent) {
        event.preventDefault();

        this.startDragging(event);
        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this));
    }

    private lastMousePosition: IPoint;

    private handleMouseUp(event: MouseEvent) {
        this.lastMousePosition = {x: event.pageX, y: event.pageY};
        this.stopDragging(event);

    }

    private startDragging(event: MouseEvent) {
        DOM.from(this.delegate.getDOM()).addClass("draggable-dragging-active");
        // TODO: SOME OTHER STUFF
    }

    private stopDragging(event: MouseEvent) {
        DOM.from(this.delegate.getDOM()).removeClass("draggable-dragging-active");
    }

    private handleMouseMove(event: MouseEvent) {
        event.preventDefault();
        const dx = event.pageX - this.lastMousePosition.x;
        const dy = event.pageY - this.lastMousePosition.y;

        // TODO: CHECK THE BOUNDS USING DOCKER MANAGER

        this.performDrag(dx, dy);

        this.lastMousePosition = {x: event.pageX, y: event.pageY};
    }

    private performDrag(dx: number, dy: number) {
        const domBounds = DOM.from(this.topElement).getBounds();
        const x = domBounds.left + dx;
        const y = domBounds.top + dy;
        DOM.from(this.topElement).css("left", x.toFixed(3) + "px").css("top", y.toFixed(3) + "px");
    }

    dispose(): void {
        this.removeDecorator();
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
        return this.delegate.on(eventName, handler);
    }

    off(eventName: string): void {
        this.delegate.off(eventName);
    }

    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.delegate.once(eventName, handler);
    }
}
