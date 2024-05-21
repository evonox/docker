import { DockManager } from "../facade/DockManager";
import { IEventEmitter } from "../common/declarations";
import { PanelContainer } from "../containers/PanelContainer";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { DOMEvent } from "../framework/dom-events";
import { DOM } from "../utils/DOM";
import { DraggableContainer } from "./DraggableContainer";
import { ResizableContainer } from "./ResizableContainer";
import { IPoint } from "../common/dimensions";
import { MOUSE_BTN_RIGHT } from "../common/constants";

/**
 * TODO: CONTEXT MENU
 */
export class Dialog implements IEventEmitter {

    private domDialog: DOM<HTMLElement>;

    private draggable: DraggableContainer;
    private resizable: ResizableContainer;

    private mouseDownEvent: DOMEvent<MouseEvent>;
    private focusEvent: DOMEvent<FocusEvent>;

    private position: IPoint;
    private isHidden: boolean = false;

    private eventManager = new ComponentEventManager();

    constructor(
        private dockManager: DockManager,
        private panel: PanelContainer,
        private grayOutParent?: PanelContainer,
        private disableResize?: boolean
    ) {
        this.initialize();
        this.dockManager.getModelContext().appendDialog(this);
        // SET DEFAULT DIALOG POSITION
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

    private initialize() {
        // Construct Dialog DOM & Decorators
        this.domDialog = DOM.create("div").attr("tabIndex", "0").addClass("dialog-floating")
            .appendChild(this.panel.getDOM())
        this.draggable = new DraggableContainer(this.panel, this.domDialog.get(), this.panel.getHeaderElement());
        this.resizable = new ResizableContainer(this.draggable, this.domDialog.get(), this.disableResize);        
        this.domDialog.appendTo(this.dockManager.getDialogRootElement());

        // Bind the DOM events
        this.mouseDownEvent = new DOMEvent<MouseEvent>(this.domDialog.get());
        this.mouseDownEvent.bind("mousedown", this.handleMouseDown.bind(this), {capture: false});
        this.focusEvent = new DOMEvent<FocusEvent>(this.domDialog.get());
        this.focusEvent.bind("focus", this.handleOnFocus.bind(this), {capture: false});

        // Bind Component Events - Dragging Facilities
        this.draggable.on("onDraggableDragStart", (event) => {
            this.eventManager.triggerEvent("onDragStart", {sender: this, event});
        });
        this.draggable.on("onDraggableDragStop", (event) => {
            this.eventManager.triggerEvent("onDragStop", {sender: this, event});
        })
        this.draggable.on("onDraggableDragMove", (event) => {
            this.eventManager.triggerEvent("onDragMove", {sender: this, event});
        });

        // Resize the dialog
        this.resize(this.panel.getWidth(), this.panel.getHeight());

        if(this.grayOutParent) {
            this.grayOutParent.grayOut(true);
        }

        // Bring the dialog to the front
        this.bringToFront();
    }

    getZIndex(): number {
        return parseInt(this.domDialog.getCss("zIndex"));
    }

    getPanel(): PanelContainer {
        return this.panel;
    }

    setPosition(x: number, y: number) {
        const outerRect = this.dockManager.getDialogRootElement().getBoundingClientRect();
        this.position = {x: x - outerRect.left, y: y - outerRect.top};
        this.domDialog.left(this.position.x).top(this.position.y);

        this.panel.setDialogPosition(this.position.x, this.position.y);
        this.dockManager.notifyOnChangeDialogPosition(this, x, y);
    }

    getPosition(): IPoint {
        return {x: this.position?.x ?? 0, y: this.position?.y ?? 0};
    }

    show() {
        this.domDialog.css("zIndex", this.dockManager.genNextDialogZIndex().toString());
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
        if(this.grayOutParent) {
            this.grayOutParent.grayOut(false);
        }

    }

    close() {
        this.hide();
        this.remove();
        // TODO: DOCKER NOTIFY ON CLOSE PANEL
        this.destroy();
    }

    remove() {
        this.domDialog.removeFromDOM();
    }

    destroy() {
        this.panel.saveLastDialogSize({w: this.resizable.getWidth(), h: this.resizable.getHeight()});

        this.mouseDownEvent.unbind();
        this.focusEvent.unbind();

        this.eventManager.disposeAll();

        this.domDialog.removeFromDOM();
        // TODO: REMOVE DRAGGABLE AND RESIZABLE
        this.draggable.removeDecorator();
        this.resizable.removeDecorator();
        // TODO: INJECT BACK TO THE DOCKING CONTAINER

        if(this.grayOutParent) {
            this.grayOutParent.grayOut(false);
        }
    }

    resize(width: number, height: number) {
        this.resizable.resize(width, height);
    }

    bringToFront() {
        // TODO: IS IT REALLY NECESSARY TO SET THE Z-INDEX ELEMENT CONTENT CONTAINER????
        this.domDialog.css("zIndex", this.dockManager.genNextDialogZIndex().toString());
        this.dockManager.setActivePanel(this.panel);
    }

    private handleOnFocus() {
        this.dockManager.setActivePanel(this.panel);
    }

    private handleMouseDown(event: MouseEvent) {
        if(event.button !== MOUSE_BTN_RIGHT) {
            this.bringToFront();
        }
    }
}
