import { Component } from "../framework/Component";

/**
 * Central DOM Update Initiator
 */
export class DOMUpdateInitiator {

    private static isUpdatedRequested: boolean = false;

    // List of update methods
    private static updateHandlers: Function[] = [];

    // Make local copy of update handlers and reset it
    // Reason: We must be ready to accept the update requests for the next browser rendering frame
    private static handleUpdateTick() {
        const updateHandlers = [...this.updateHandlers];
        this.updateHandlers = [];

        for(const updateHandler of updateHandlers) {
            updateHandler();
        }
    }

    private static requestNextUpdateTick() {        
        this.isUpdatedRequested = true;

        requestAnimationFrame(() => {
            // Note: Before processing the handler queue - reset the flag to accept 
            // the update requests for the next animation frame
            this.isUpdatedRequested = false;
            this.handleUpdateTick();
        });
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
