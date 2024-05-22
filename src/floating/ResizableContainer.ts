import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { ResizeHandle, ResizeHandleType } from "./ResizeHandle";
import { IState } from "../common/serialization";
import { IContextMenuAPI } from "../common/panel-api";
import { IDeltaRect, IPoint, IRect, ISize } from "../common/dimensions";
import { ContainerType } from "../common/enumerations";


export class ResizableContainer implements IDockContainer {

    private resizeHandles: ResizeHandle[] = [];

    constructor(private delegate: IDockContainer, private topElement: HTMLElement, private disableResize: boolean = false) {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.buildResizeHandles();
    }
    queryLoadedSize(): ISize {
        throw new Error("Method not implemented.");
    }
    onQueryContextMenu(config: IContextMenuAPI): void {
        throw new Error("Method not implemented.");
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

    private buildResizeHandles() {
        if(! this.disableResize) {
            this.buildResizeHandle({north: true, south: false, west: false, east: false});
            this.buildResizeHandle({north: false, south: true, west: false, east: false});
            this.buildResizeHandle({north: false, south: false, west: true, east: false});
            this.buildResizeHandle({north: false, south: false, west: false, east: true});

            this.buildResizeHandle({north: true, south: false, west: true, east: false});
            this.buildResizeHandle({north: false, south: true, west: true, east: false});
            this.buildResizeHandle({north: false, south: true, west: false, east: true});
        }
    }

    private buildResizeHandle(kind: ResizeHandleType) {
        const resizeHandle = new ResizeHandle(kind);
        this.topElement.appendChild(resizeHandle.getDOM());
        this.resizeHandles.push(resizeHandle);

        resizeHandle.on("mousedown", this.handleMouseDown);
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        this.delegate.performLayout(children, relayoutEvenIfEqual);
    }

    dispose() {
        this.removeDecorator();
        this.delegate.dispose()
    }

    removeDecorator() {
        for(const resizeHandle of this.resizeHandles) {
            resizeHandle.dispose();
        }
        this.resizeHandles = [];
    }

    private lastMousePos: IPoint;
    private draggedHandle: ResizeHandle;

    private handleMouseDown(payload: any) {
        const { handle, event } = payload;
        this.draggedHandle = handle;

        this.lastMousePos = {x: event.pageX, y: event.pageY};
        DragAndDrop.start(event, this.handleMouseMove.bind(this), this.handleMouseUp.bind(this));
    }

    private handleMouseMove(event: MouseEvent) {
        // TODO: SUSPEND PANEL LAYOUT? WHY?
        
        const dx = event.pageX - this.lastMousePos.x;
        const dy = event.pageY - this.lastMousePos.y;

        // TODO: CHECK BOUNDS INSIDE CONTAINER
        this.performDrag(this.draggedHandle, dx, dy);
        this.lastMousePos = {x: event.pageX, y: event.pageY};

        // TODO: RESUME PANEL LAYOUT? WHY?
        // TODO: NOTIFY - CONTAINER RESIZED
    }

    private handleMouseUp(event: MouseEvent) {
        delete this.lastMousePos;
        delete this.draggedHandle;
    }

    private performDrag(handle: ResizeHandle, dx: number, dy: number) {
        const bounds = DOM.from(this.topElement).getBounds();
        const rect: IRect = {x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height};

        if(handle.north()) this.resizeNorth(dy, rect);
        if(handle.south()) this.resizeSouth(dy, rect);
        if(handle.west()) this.resizeWest(dx, rect);
        if(handle.east()) this.resizeEast(dx, rect);
    }

    private resizeNorth(delta: number, bounds: IRect) {
        this.resizeContainer(bounds, {dx: 0, dy: delta, dw: 0, dh: -delta});
    }

    private resizeSouth(delta: number, bounds: IRect) {
        this.resizeContainer(bounds, {dx: 0, dy: 0, dw: 0, dh: delta});       
    }

    private resizeEast(delta: number, bounds: IRect) {
        this.resizeContainer(bounds, {dx: 0, dy: 0, dw: delta, dh: 0});             
    }

    private resizeWest(delta: number, bounds: IRect) {
        this.resizeContainer(bounds, {dx: delta, dy: 0, dw: -delta, dh: 0});             
    }

    private resizeContainer(bounds: IRect, delta: IDeltaRect) {
        bounds.x += delta.dx;
        bounds.y += delta.dy;
        bounds.w += delta.dw;
        bounds.h += delta.dh;

        bounds.w = Math.max(bounds.w, this.getMinWidth());
        bounds.h = Math.max(bounds.h, this.getMinHeight());

        DOM.from(this.topElement)
            .css("left", bounds.x.toFixed(3) + "px")
            .css("top", bounds.y.toFixed(3) + "px");
        
        this.resize(bounds.w, bounds.h);
    }

    /**
     *  PURE DECORATOR OVERRIDES
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
