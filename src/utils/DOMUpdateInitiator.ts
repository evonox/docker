import { Component } from "../framework/Component";
import { DebugHelper } from "./DebugHelper";

/**
 * Central DOM Update Initiator
 */
export class DOMUpdateInitiator {

    // Flag means that there has been requestAnimationUpdate invoked
    private static isUpdatedRequested: boolean = false;

    // List of update methods
    private static domUpdateHandlers: Function[] = [];
    private static componentUpdateHandlers: Function[] = [];

    // Flag is force update is running
    private static isForceUpdateRunning = false;

    // Make local copy of update handlers and reset it
    // Reason: We must be ready to accept the update requests for the next browser rendering frame
    private static processAllDOMUpdates() {
        const updateHandlers = [...this.domUpdateHandlers];
        this.domUpdateHandlers = [];

        for(const updateHandler of updateHandlers) {
            updateHandler();
        }
    }

    private static processAllComponentUpdates() {
        const updateHandlers = [...this.componentUpdateHandlers];
        this.componentUpdateHandlers = [];

        for(const updateHandler of updateHandlers) {
            updateHandler();
        }
    }

    private static requestNextUpdateTick() {        
        this.isUpdatedRequested = true;

        requestAnimationFrame(() => {
            // First, process the component updates - they will generate another DOM updates
            this.processAllComponentUpdates();
            // Then process all queued DOM updates
            this.processAllDOMUpdates();
            // Reset the update flag            
            this.isUpdatedRequested = false;

            // If there are some pending handlers, queue the next animation frame request 
            if(this.domUpdateHandlers.length > 0 || this.componentUpdateHandlers.length > 0) {
                this.requestNextUpdateTick();
            }
        });
    }
    
    /**
     * Force Methods - they empty the update queue
     */

    // Note: Use this method sparingly only for edge cases
    static forceAllEnqueuedUpdates() {
        if(this.isForceUpdateRunning)
            return;
        this.isForceUpdateRunning = true;

        this.processAllComponentUpdates();
        this.processAllDOMUpdates();

        this.isForceUpdateRunning = false;
    }

    static forceEnqueuedComponentUpdates() {
        if(this.isForceUpdateRunning)
            return;
        this.isForceUpdateRunning = true;

        this.processAllComponentUpdates();

        this.isForceUpdateRunning = false;
    }

    static forceEnqueuedDOMUpdates() {
        if(this.isForceUpdateRunning)
            return;
        this.isForceUpdateRunning = true;

        this.processAllDOMUpdates();

        this.isForceUpdateRunning = false;
    }

    /**
     * Registering new update handlers to process
     */

    static requestDOMUpdate(handler: () => void) {
        if(DebugHelper.isDOMQueuedUpdatesEnabled()) {
            this.domUpdateHandlers.push(handler);
            if(this.isUpdatedRequested === false) {
                this.requestNextUpdateTick();
            }   
        } else {
            handler();
        }
    }

    static requestComponentUpdate(component: Component) {
        if(DebugHelper.isDOMQueuedUpdatesEnabled()) {
            this.componentUpdateHandlers.push(() => {
                component.updateComponent();
            })
            if(this.isUpdatedRequested === false) {
                this.requestNextUpdateTick();
            }   
        } else {
            component.updateComponent();
        }
    }
}
