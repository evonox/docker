import { DockManager } from "../facade/DockManager";
import { IEventEmitter } from "../common/declarations";
import { PanelContainer } from "../containers/PanelContainer";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent } from "../framework/dom-events";
import { DOM } from "../utils/DOM";
import { DraggableContainer } from "./DraggableContainer";
import { ResizableContainer } from "./ResizableContainer";
import { IPoint, IRect } from "../common/dimensions";
import { MOUSE_BTN_RIGHT } from "../common/constants";

import "./Dialog.css";
import { DebugHelper } from "../utils/DebugHelper";

export class Dialog implements IEventEmitter {

    private domDialog: DOM<HTMLElement>;

    private draggable: DraggableContainer;
    private resizable: ResizableContainer;

    private mouseDownEvent: DOMEvent<MouseEvent>;

    private position: IPoint;
    private isHidden: boolean = false;
    private lastExpanedSize: number;

    private eventManager = new ComponentEventManager();

    private lastDialogZIndex: number;
    private lastContextZIndex: number;

    constructor(
        private dockManager: DockManager,
        private panel: PanelContainer,
    ) {
        this.handleDragStartEvent = this.handleDragStartEvent.bind(this);
        this.handleDragMoveEvent = this.handleDragMoveEvent.bind(this);
        this.handleDragEndEvent = this.handleDragEndEvent.bind(this);

        this.initialize();

        this.dockManager.getModelContext().appendDialog(this);
        this.panel.setHeaderVisibility(true);

        this.dockManager.notifyOnCreateDialog(this);
    }

    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.eventManager.subscribe(eventName, handler);
    }
    off(eventName: string): void {
         this.eventManager.unsubscribeAll(eventName);
    }
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.eventManager.subscribeOnce(eventName, handler);
    }

    getDialogFrameDOM() {
        return this.domDialog.get();
    }

    private initialize() {
        // Construct Dialog DOM & Decorators
        this.domDialog = DOM.create("div").attr("tabIndex", "-1").addClass("DockerTS-Dialog");
        this.draggable = new DraggableContainer(this.dockManager, this.panel, this.domDialog.get(), this.panel.getHeaderElement());
        this.resizable = new ResizableContainer(this.dockManager, this.draggable, this.domDialog.get());        
        this.domDialog.appendTo(this.dockManager.getContainerElement());
        this.resizable.on("onDialogResized", this.handleResizeEvent.bind(this));

        // Bind the DOM events
        this.mouseDownEvent = new DOMEvent<MouseEvent>(this.domDialog.get());
        this.mouseDownEvent.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});
        this.panel.on("onFocused", this.handleOnFocus.bind(this));
        this.panel.on("onExpanded", this.handleOnExpand.bind(this));
        this.panel.on("onCollapsed", this.handleOnCollapse.bind(this));

        // Bind Component Events - Dragging Facilities
        this.draggable.on("onDraggableDragStart", this.handleDragStartEvent);
        this.draggable.on("onDraggableDragMove", this.handleDragMoveEvent);
        this.draggable.on("onDraggableDragStop", this.handleDragEndEvent);
       
        // Bring the dialog to the front
        this.bringToFront();
    }

    private handleDragStartEvent(event: MouseEvent) {
        this.bringToFront();

        this.lastDialogZIndex = DOM.from(this.getDialogFrameDOM()).getZIndex();
        this.lastContextZIndex = this.panel.getContentFrameDOM().getZIndex();

        const zIndexWheel = this.dockManager.config.zIndexes.zIndexWheel;
        DOM.from(this.getDialogFrameDOM()).zIndex(zIndexWheel);
        this.panel.getContentFrameDOM().addClass("DockerTS-ContentFrame--Dragging").zIndex(zIndexWheel);
        
        this.eventManager.triggerEvent("onDragStart", {sender: this, event});
    }

    private handleDragMoveEvent(payload: any) {
        this.setPosition(payload.x, payload.y);
        this.eventManager.triggerEvent("onDragMove", {sender: this, event: payload.event});
    }

    private handleDragEndEvent(event: MouseEvent) {
        DOM.from(this.getDialogFrameDOM()).zIndex(this.lastDialogZIndex);
        this.panel.getContentFrameDOM().removeClass("DockerTS-ContentFrame--Dragging").zIndex(this.lastContextZIndex);

        this.eventManager.triggerEvent("onDragStop", {sender: this, event});
        this.bringToFront();
    }

    getZIndex(): number {
        return parseInt(this.domDialog.getCss("zIndex"));
    }

    getPanel(): PanelContainer {
        return this.panel;
    }

    setPosition(x: number, y: number) {
        const outerRect = this.dockManager.getContainerElement().getBoundingClientRect();
        this.position = {x: x - outerRect.left, y: y - outerRect.top};
        this.domDialog.left(this.position.x).top(this.position.y); 
        this.resizePanelByDialog();
    }

    getPosition(): IPoint {
        return {x: this.position?.x ?? 0, y: this.position?.y ?? 0};
    }

    show() {
        this.domDialog.css("zIndex", this.dockManager.genNextDialogZIndex().toString()).css("display", "");
        // TODO: ELEMENT CONTAINER Z-INDEX???
        if(this.isHidden) {
            this.isHidden = false;
            // TODO: NOTIFY DOCKER MANAGER - POSSIBLY TRIGGER OPERATION
        }
    }

    hide() {
        this.domDialog.css("zIndex", "0").css("display", "none");
        if(! this.isHidden) {
            this.isHidden = true;
            // TODO: NOTIFY DOCKER MANAGER
        }
    }

    close() {
        this.hide();
        this.remove();
        this.destroy();
    }

    remove() {
        this.domDialog.removeFromDOM();
    }

    destroy() {
        this.mouseDownEvent.unbind();
        this.eventManager.disposeAll();

        this.domDialog.removeFromDOM();
        this.draggable.dispose();
        this.resizable.dispose();

        this.dockManager.getModelContext().removeDialog(this);
    }

    resize(rect: IRect) {
        this.domDialog.width(rect.w).height(rect.h);
        this.resizePanelByDialog();
    }

    bringToFront() {
        const nextZIndex = this.dockManager.genNextDialogZIndex();
        this.domDialog.zIndex(nextZIndex);
        this.dockManager.setActivePanel(this.panel);
        // TODO: UNIFY UPDATE STATE
        this.panel.updateLayoutState();
        this.panel.updateContainerState();
    }

    private handleResizeEvent(rect: IRect) {
        this.setPosition(rect.x, rect.y);
        this.resize(rect);
    }

    private handleOnFocus() {
        this.bringToFront();
        this.dockManager.setActivePanel(this.panel);
    }

    private handleMouseDown(event: MouseEvent) {
        if(event.button !== MOUSE_BTN_RIGHT) {
            this.bringToFront();
        }
    }

    private handleOnCollapse() {
        this.lastExpanedSize = this.domDialog.getHeight();
        const bounds = this.panel.getHeaderElement().getBoundingClientRect();
        this.domDialog.height(bounds.height);
    }

    private handleOnExpand() {
        this.domDialog.height(this.lastExpanedSize);
    }

    private resizePanelByDialog() {
        const rect = this.domDialog.getBoundsRect();
        this.panel.resize(rect);
    }
}
