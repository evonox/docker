import { DOMEvent, DOMEventHandler } from "./dom-events";

export interface DOMEventSubscription {
    unbind(): void;
}

class DOMHandlerSubscription implements DOMEventSubscription {

    constructor(private domEvent: DOMEvent<Event>, private manager: DOMEventManager) {}

    unbind(): void {
        this.manager.removeSubscription(this);
        this.domEvent.unbind();
    }
}

export class DOMEventManager {

    private subscriptions: DOMEventSubscription[] = [];

    bind(element: HTMLElement, eventName: string, handler: DOMEventHandler<Event>, opts: {capture: boolean}): DOMEventSubscription {
        let domEvent = new DOMEvent(element);
        domEvent.bind(eventName, handler, {capture: opts.capture});
        const subscription = new DOMHandlerSubscription(domEvent, this);
        this.subscriptions.push(subscription);
        return subscription;
    }

    unbindAll() {
        // Note: the collection of subscription gets modified, we need to create
        // a copy of it for iteration
        const subscriptions = [...this.subscriptions];
        for(let subscription of subscriptions) {
            subscription.unbind();
        }
        this.subscriptions = [];
    }

    removeSubscription(subcription: DOMEventSubscription) {
        const index = this.subscriptions.indexOf(subcription);
        if(index >= 0) {
            this.subscriptions.splice(index, 1);
        }
    }
}
