import { Component } from "../framework/Component";

/**
 * Central DOM Update Initiator
 */
export class DOMUpdateInitiator {

    private static isUpdatedRequested: boolean = false;

    // List of update methods
    private static updateHandlers: Function[] = [];

    // Flag is force update is running
    private static isForceUpdateRunning = false;
    private static isUpdateProcessRunning = false;

    // Make local copy of update handlers and reset it
    // Reason: We must be ready to accept the update requests for the next browser rendering frame
    private static processAllUpdates() {
        this.isUpdateProcessRunning = true;
        
        const updateHandlers = [...this.updateHandlers];
        this.updateHandlers = [];

        for(const updateHandler of updateHandlers) {
            updateHandler();
        }

        this.isUpdateProcessRunning = false;
    }

    private static requestNextUpdateTick() {        
        this.isUpdatedRequested = true;

        requestAnimationFrame(() => {
            this.processAllUpdates();

            this.isUpdatedRequested = false;
            if(this.updateHandlers.length > 0) {
                this.requestNextUpdateTick();
            }
        });
    }

    // Note: Use this method sparingly only for edge cases
    static forceAllEnqueuedUpdates() {
        if(this.isForceUpdateRunning)
            return;
        this.isForceUpdateRunning = true;
        this.processAllUpdates();
        this.isForceUpdateRunning = false;
    }

    static requestDOMUpdate(handler: () => void) {
        this.updateHandlers.push(handler);
        if(this.isUpdatedRequested === false) {
            this.requestNextUpdateTick();
        }
    }

    static requestComponentUpdate(component: Component) {
        this.requestDOMUpdate(() => {
            component.updateComponent();
        });
    }
}
