import { DOMEventHandler } from "./dom-events";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "./component-events";
import { DOMEventManager, DOMEventSubscription } from "./dom-event-manager";


export abstract class Component {

    private element: HTMLElement | undefined;

    private domEventManager: DOMEventManager = new DOMEventManager();
    private componentEventManager: ComponentEventManager = new ComponentEventManager();

    private _isUpdateRequested: boolean = false;

    constructor() {
        this.requestUpdate = this.requestUpdate.bind(this);
    }

    isUpdateRequested() {
        return this._isUpdateRequested;
    }

    protected initializeComponent() {
        this.onInitialized();
        this.element = this.onInitialRender();
    }

    public getDOM(): HTMLElement {
        return this.element;
    }

    detachFromDOM() {
        this.element.remove();
    }

    public dispose() {
        this.onDisposed();

        this.domEventManager.unbindAll();
        this.componentEventManager.disposeAll();

        this.element.remove();
        this.element = undefined;
    }

    public on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.componentEventManager.subscribe(eventName, handler);
    }

    public off(eventName: string) {
        return this.componentEventManager.unsubscribeAll(eventName);
    }

    public once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.componentEventManager.subscribeOnce(eventName, handler);
    }

    protected triggerEvent(eventName: string, payload?: any) {
        this.componentEventManager.triggerEvent(eventName, payload);
    }

    protected bind(dom: HTMLElement | Window, eventName: string, handler: DOMEventHandler<Event>, options?: {capture?: boolean}): DOMEventSubscription {
        const isCapture = options?.capture ?? false;
        return this.domEventManager.bind(dom, eventName, handler.bind(this), {capture: isCapture});
    }

    protected abstract onInitialized(): void;

    protected abstract onDisposed(): void;

    protected abstract onInitialRender(): HTMLElement;

    protected abstract onUpdate(element: HTMLElement): void;

    public requestUpdate() {
        if(this.isUpdateRequested() !== true) {
            this._isUpdateRequested = true;
            setTimeout(() => {
                this.handleUpdateRequest();
            });
        }
    }

    private handleUpdateRequest() {
        this._isUpdateRequested = false;
        this.onUpdate(this.element);
    }
}