import { IChannel, ISubscriptionAPI } from "../common/panel-api";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";

// Default Channel Name - it is used when the client code does not specify the channel name
const DEFAULT_CHANNEL_NAME = "__DEFAULT_CHANNEL__";

/**
 * Adapter class over ComponentEventManager class which is used as a medium for channel communication
 */
class Channel implements IChannel {

    private eventManager: ComponentEventManager = new ComponentEventManager();

    constructor(private name: string) {}

    getChannelName() {
        return this.name;
    }

    notify(eventName: string, payload?: any): void {
        this.eventManager.triggerEvent(eventName, payload);
    }

    subscribe(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI {
        return this.eventManager.subscribe(eventName, handler);
    }

    subscribeOnce(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI {
        return this.eventManager.subscribeOnce(eventName, handler);
    }

    unsubscribeAll(eventName: string): void {
        this.eventManager.unsubscribeAll(eventName);
    }
}

/**
 * Main facade class over channel communication - manages the lazy creation of communication channels
 */
export class ChannelManager {

    private channels: Channel[] = [];

    getChannel(name?: string): IChannel {
        if(name === undefined)
            name = DEFAULT_CHANNEL_NAME;

        let channel = this.lookupChannel(name);
        if(channel === undefined) {
            channel = new Channel(name);
            this.channels.push(channel);
        }

        return channel;
    }

    private lookupChannel(name: string) {
        return this.channels.find(c => c.getChannelName() === name);
    }
}
