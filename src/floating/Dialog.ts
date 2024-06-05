import { DockManager } from "../facade/DockManager";
import { IEventEmitter } from "../common/declarations";
import { PanelContainer } from "../containers/PanelContainer";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent } from "../framework/dom-events";
import { DOM } from "../utils/DOM";
import { DraggableContainer } from "./DraggableContainer";
import { ResizableContainer } from "./ResizableContainer";
import { IPoint, IRect } from "../common/dimensions";

import "./Dialog.css";

/**
 * Class reponsible for managing floating dialog frame for the panel container
 */
export class Dialog implements IEventEmitter {

    private domDialog: DOM<HTMLElement>;

    private draggable: DraggableContainer;
    private resizable: ResizableContainer;

    private mouseDownEvent: DOMEvent<MouseEvent>;

    private subOnFocused: ComponentEventSubscription;
    private subOnExpanded: ComponentEventSubscription;
    private subOnCollapsed: ComponentEventSubscription;
    private subOnClosed: ComponentEventSubscription;

    private position: IPoint;
    private isHidden: boolean = false;
    private lastExpanedSize: number;

    private eventManager = new ComponentEventManager();

    private lastDialogZIndex: number;

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

        // Bind the DOM events
        this.mouseDownEvent = new DOMEvent<MouseEvent>(this.domDialog.get());
        this.mouseDownEvent.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});

        // Bind Panel Events
        this.subOnFocused = this.panel.on("onFocused", this.handleOnFocus.bind(this));
        this.subOnExpanded = this.panel.on("onExpanded", this.handleOnExpand.bind(this));
        this.subOnCollapsed = this.panel.on("onCollapsed", this.handleOnCollapse.bind(this));
        this.subOnClosed = this.panel.on("onClose", this.handleOnClose.bind(this));

        // Bind Component Events - Dragging Facilities
        this.draggable.on("onDraggableDragStart", this.handleDragStartEvent);
        this.draggable.on("onDraggableDragMove", this.handleDragMoveEvent);
        this.draggable.on("onDraggableDragStop", this.handleDragEndEvent);

        // Bind Resizable Events
        this.resizable.on("onDialogResized", this.handleResizeEvent.bind(this));

        // Bring the dialog to the front
        this.assignNewZIndex();
        this.dockManager.setActivePanel(this.panel);
    }

    /**
     * Drag-and-drop Event Handlers
     */

    private handleDragStartEvent(event: MouseEvent) {
        const zIndexWheel = this.dockManager.config.zIndexes.zIndexWheel;
        DOM.from(this.getDialogFrameDOM()).zIndex(zIndexWheel);
        this.adjustDialogDraggingPosition(event);
        this.panel.updateState();

        this.panel.onDraggingStarted();

        this.eventManager.triggerEvent("onDragStart", {sender: this, event});
    }

    private handleDragMoveEvent(payload: any) {
        this.setPosition(payload.x, payload.y);
        this.eventManager.triggerEvent("onDragMove", {sender: this, event: payload.event});
    }

    private handleDragEndEvent(event: MouseEvent) {
        DOM.from(this.getDialogFrameDOM()).zIndex(this.lastDialogZIndex);
        this.panel.updateState();
        this.panel.onDraggingEnded();
        this.eventManager.triggerEvent("onDragStop", {sender: this, event});
    }

    private adjustDialogDraggingPosition(event: MouseEvent) {
        // Adjust the position of dialog if the drag handle offset is out of bounds
        const dialogBounds = DOM.from(this.getDialogFrameDOM()).getBoundsRect();
        if(event.pageX > dialogBounds.x + dialogBounds.w * 0.75) {
            const positionX = event.pageX - dialogBounds.w * 0.75;
            const position = this.getPosition();
            this.setPosition(positionX, position.y);
        }
    }

    /**
     * Public API Methods
     */

    getZIndex(): number {
        return this.domDialog.getZIndex();
    }

    getPanel(): PanelContainer {
        return this.panel;
    }

    getPosition(): IPoint {
        return {x: this.position?.x ?? 0, y: this.position?.y ?? 0};
    }

    setPosition(x: number, y: number) {
        this.position = {x: x, y: y};
        this.domDialog.left(this.position.x).top(this.position.y); 
        this.panel.updateState();

        this.dockManager.notifyOnChangeDialogPosition(this, x, y);
    }

    resize(rect: IRect) {
        this.domDialog.left(rect.x).top(rect.y).width(rect.w).height(rect.h);
        this.dockManager.notifyOnChangeDialogPosition(this, rect.x, rect.y);
    }

    show() {
        this.domDialog.css("display", "");
        if(this.isHidden) {
            this.isHidden = false;
            this.dockManager.notifyOnShowDialog(this);
        }
    }

    hide() {
        this.domDialog.css("display", "none");
        if(! this.isHidden) {
            this.isHidden = true;
            this.dockManager.notifyOnHideDialog(this);
        }
    }

    destroy() {
        this.mouseDownEvent.unbind();
        this.eventManager.disposeAll();

        this.subOnClosed.unsubscribe();
        this.subOnCollapsed.unsubscribe();
        this.subOnExpanded.unsubscribe();
        this.subOnFocused.unsubscribe();

        this.domDialog.removeFromDOM();
        this.draggable.dispose();
        this.resizable.dispose();

        this.dockManager.getModelContext().removeDialog(this);
    }


    bringToFront() {
        if(this.dockManager.isToplevelDialog(this))
            return;
        this.dockManager.moveDialogToTop(this);

        this.assignNewZIndex();
        this.dockManager.setActivePanel(this.panel);
    }

    private assignNewZIndex() {
        const nextZIndex = this.dockManager.genNextDialogZIndex();
        this.lastDialogZIndex = nextZIndex;
        this.domDialog.zIndex(nextZIndex);
        this.panel.updateState();
    }

    /**
     * Misc Event Handlers
     */

    private handleResizeEvent(rect: IRect) {
        this.resize(rect);
    }

    private handleOnFocus() {
        this.bringToFront();
        this.dockManager.setActivePanel(this.panel);
    }

    private handleMouseDown(event: MouseEvent) {
        this.bringToFront();
    }

    private handleOnCollapse() {
        this.lastExpanedSize = this.domDialog.getHeight();
        const bounds = this.panel.getHeaderElement().getBoundingClientRect();
        this.domDialog.height(bounds.height);
    }

    private handleOnExpand() {
        this.domDialog.height(this.lastExpanedSize);
    }

    private handleOnClose() {
        this.destroy();
    }
}
