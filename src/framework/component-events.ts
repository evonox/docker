
export interface ComponentEventHandler {
    (payload?: any): void;
}

export interface ComponentEventSubscription {
    unsubscribe(): void;
}

export class EventHandlerSubscription implements ComponentEventSubscription {
   
    private handler?: ComponentEventHandler;

    constructor(handler: ComponentEventHandler, private eventList: ComponentEvent) {
        this.handler = handler;
    }

    trigger(payload?: any) {
        this.handler?.(payload);
    }

    unsubscribe(): void {
        this.eventList.removeSubscription(this);
        this.handler = undefined;
    }
}

export class ComponentEvent {

    private subscriptions: EventHandlerSubscription[] = [];

    constructor(private eventName: string) {}

    getEventName() {
        return this.eventName;
    }

    disposeAll() {
        // Note: Need to create the local copy of array, it gets modified when removing subscriptions
        const subscription = [...this.subscriptions];
        for(let event of subscription) {
            event.unsubscribe();
        }
    }

    subscribe(handler: ComponentEventHandler): ComponentEventSubscription {
        const subscription = new EventHandlerSubscription(handler, this);
        this.subscriptions.push(subscription);
        return subscription;
    }

    trigger(payload?: any) {
        for(let subscription of this.subscriptions) {
            subscription.trigger(payload);
        }
    }

    removeSubscription(event: EventHandlerSubscription) {
        const index = this.subscriptions.indexOf(event);
        if(index >= 0) {
            this.subscriptions.splice(index, 1);
        }
    }
}

export class ComponentEventManager {

    private componentEvents: ComponentEvent[] = [];

    subscribe(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        let eventList = this.lookupEvent(eventName);
        if(eventList !== undefined) {
            return eventList.subscribe(handler);
        }
        else {
            eventList = new ComponentEvent(eventName);
            this.componentEvents.push(eventList);
            return eventList.subscribe(handler);
        }
    }

    subscribeOnce(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        const subscription = this.subscribe(eventName, (payload) => {
            handler(payload);
            subscription.unsubscribe();
        });
        return subscription;
    }

    unsubscribeAll(eventName: string) {
        this.lookupEvent(eventName)?.disposeAll();
    }

    triggerEvent(eventName: string, payload?: any) {
        this.lookupEvent(eventName)?.trigger(payload);
    }

    disposeAll() {
        for(let componetEvent of this.componentEvents) {
            componetEvent.disposeAll();
        }
        this.componentEvents = [];
    }

    private lookupEvent(eventName: string): ComponentEvent | undefined {
        return this.componentEvents.find(evt => evt.getEventName() == eventName);
    }
}
