import { IEventEmitter } from "../common/declarations";
import { IPoint } from "../common/dimensions";
import { DockManager } from "../facade/DockManager";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { TabHandle } from "../tabview/TabHandle";
import { TabHostStrip } from "../tabview/TabHostStrip";
import { TabReorderOperation } from "./TabReorderOperation";
import { TabUndockOperation } from "./TabUndockOperation";


/**
 * Wrapper Operation Class for TabReorderOperation that can change into TabUndockOperation
 */
export class TabDualOperation implements IEventEmitter {

    private eventManager = new ComponentEventManager();
    
    private isUndockInitiated = false;

    private tabReorderOperation: TabReorderOperation;
    private tabUndockOperation: TabUndockOperation;
 

    constructor(
        private dockManager: DockManager, 
        private tabStrip: TabHostStrip,
        private draggedHandle: TabHandle,
    ) {
        // Start with TabReorderOperation
        this.tabReorderOperation = new TabReorderOperation(
            this.dockManager, this.tabStrip, this.draggedHandle, this.draggedHandle.getUndockEnabled()
        );
        
        // Register some redirected events
        this.tabReorderOperation.on("onTabReordered", payload => {
            this.eventManager.triggerEvent("onTabReordered", payload);
        });

        this.tabReorderOperation.on("onUndockRequest", this.handleUndockRequest.bind(this));
    }

    processMouseDown(event: MouseEvent) {
        if(this.isUndockInitiated) {
            this.tabUndockOperation.processMouseDown(event);
        } else {
            this.tabReorderOperation.processMouseDown(event);
        }
    }

    processMouseMove(event: MouseEvent) {
        if(this.isUndockInitiated) {
            this.tabUndockOperation.processMouseMove(event);
        } else {
            this.tabReorderOperation.processMouseMove(event);
        }
    }

    processCancelRequest() {
        if(this.isUndockInitiated) {
            this.tabUndockOperation.processCancelRequest();
        } else {
            this.tabReorderOperation.processCancelRequest();
        }
        
        this.dispose();
    }


    processMouseUp(event: MouseEvent) {
        if(this.isUndockInitiated) {
            this.tabUndockOperation.processMouseUp(event);
        } else {
            this.tabReorderOperation.processMouseUp(event);
        }

        this.dispose();
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

    private async handleUndockRequest(event: MouseEvent) {
        const tabHandleRect = this.draggedHandle.getDOM().getBoundingClientRect();
        const dragOffset: IPoint = {
            x: Math.max(event.pageX - tabHandleRect.left, 40), // TODO: Where to define this
            y: tabHandleRect.height / 2
        };

        const draggedPanel = this.tabStrip.getTabHost().getTabPageByHandle(this.draggedHandle).getContainer();
        this.tabUndockOperation = new TabUndockOperation(draggedPanel, dragOffset);
        await this.tabUndockOperation.processMouseDown(event);

        this.isUndockInitiated = true;
    }

    private dispose() {
        this.eventManager.disposeAll();
    }
}