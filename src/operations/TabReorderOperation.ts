import { IEventEmitter } from "../common/declarations";
import { IPoint } from "../common/dimensions";
import { DockManager } from "../facade/DockManager";
import { ComponentEventHandler, ComponentEventManager, ComponentEventSubscription } from "../framework/component-events";
import { TabHandle } from "../tabview/TabHandle";
import { TabHostStrip } from "../tabview/TabHostStrip";
import { DOM } from "../utils/DOM";
import { AnimationHelper, IAnimation } from "../utils/animation-helper";
import { TabReorderIndexMap } from "./TabReorderIndexMap";

/**
 * Method Object Pattern - used to process the drag-and-drop operation for the tab handle reordering
 * 
 * Events:
 *      onTabReorder    - raised on successful tab reorder operation
 *      onCancelled     - raised in case of the tab reorder operation is cancelled (e.g. by Escape key)
 *      onUndockRequest - raised when this operation transforms from tab reordering to undock operation
 */
export class TabReorderOperation implements IEventEmitter {

    private eventManager = new ComponentEventManager();

    private fromIndex: number;
    private toIndex: number;

    private dragOffset: IPoint;
    private dragMinimumLeft: number;
    private dragMaximumRight: number;

    private lastX: number;

    private indexMap: TabReorderIndexMap;

    private domTabHandles: DOM<HTMLElement>[] = [];

    private lastAnimation: IAnimation;

    constructor(
        private dockManager: DockManager, 
        private tabStrip: TabHostStrip,
        private draggedHandle: TabHandle,
        private checkUndockRequest: boolean = false
    ) {
    }

    /**
     *  Main API methods running the tab reorder operation
     */

    processMouseMove(event: MouseEvent) {
        if(this.checkUndock(event)) {
            this.handleUndockRequested();
            return;
        }
        
        if(! this.adjustDraggedTabHandlePosition(event)) {
            this.lastX = event.pageX;
            return;
        }

        if(event.pageX < this.lastX) { // dragging left
            if(this.checkTabReorderToLeft()) {
                this.toIndex--;
                this.indexMap.applyReorderLeft(this.toIndex);
                // Note: tab reorder left means we traslate given handle right
                this.translateTabHandleToRight();               
            }
        } else if(event.pageX > this.lastX) { // dragging right
            if(this.checkTabReorderToRight()) {
                this.toIndex++;
                this.indexMap.applyReorderRight(this.toIndex);
                // Note: tab reorder right means we traslate given handle left
                this.translateTabHandleToLeft();
            }
        }

        this.lastX = event.pageX;
    }

    processMouseDown(event: MouseEvent) {
        this.initialize();

        const boundsDraggedHandle = this.domTabHandles[this.fromIndex].getBounds();
        this.dragOffset = {
            x: event.pageX - boundsDraggedHandle.left,
            y: event.pageY - boundsDraggedHandle.top
        };

        this.lastX = event.pageX;
    }

    processMouseUp(event: MouseEvent) {
        this.handleCompletionRequest();
    }

    processCancelRequest() {
        this.handleCancelRequest();
    }

    private initialize() {
        // Extract tabHandle DOMs 
        this.tabStrip.queryAttachedHandles().forEach(tabHandle => {
            const domElement = tabHandle.getDOM();
            this.domTabHandles.push(DOM.from(domElement));
        });

        // Initialize reorder index map
        this.indexMap = new TabReorderIndexMap(this.domTabHandles.length);

        // Initialize drag and drop bounds
        this.dragMinimumLeft = this.domTabHandles[0].getBounds().left;
        this.dragMaximumRight = this.domTabHandles[this.domTabHandles.length - 1].getBounds().right;

        // Perform their positioning for drag-and-drop operation
        const zIndex = this.dockManager.config.zIndexes.zIndexTabReorderOperation;
        // Prevent DOM TabHostStrip from loosing its height when the tab handles are removed 
        // from document flow
        const domTabStrip = DOM.from(this.tabStrip.getDOM());
        domTabStrip.css("min-height", domTabStrip.getHeight()+ "px");

        this.domTabHandles.forEach(dom => {
            const parentBounds = dom.getOffsetParent().getBounds(); 
            const bounds = dom.getBounds();
            dom.left(bounds.left - parentBounds.left)
                .top(bounds.top - parentBounds.top)
                .zIndex(zIndex);
        });
        this.domTabHandles.forEach(dom => dom.css("position", "absolute"));

        // Initialize indexes
        this.fromIndex = this.toIndex = this.tabStrip.queryAttachedHandles().indexOf(this.draggedHandle);
        if(this.fromIndex < 0) {
            throw new Error("ERROR: Dragged TabHandle not found in the TabHostStrip.");
        }

        // The dragged TabHandle must be above the rest of tab handles
        this.domTabHandles[this.fromIndex].zIndex(zIndex + 1);
    }

    private clenaUp() {
        // Cleanup all the applied CSS styles used by this operation
        this.domTabHandles.forEach(dom => {
            dom.css("position", "").css("left", "").css("top", "").zIndex("");
        });

        const domTabStrip = DOM.from(this.tabStrip.getDOM());
        domTabStrip.css("min-height", "");

        this.domTabHandles = [];
        this.eventManager.disposeAll();
    }

    private adjustDraggedTabHandlePosition(event: MouseEvent): boolean {
        const domDraggedHandle = this.domTabHandles[this.fromIndex];
        // Adjust position by mouse drag offset
        let left = event.pageX - this.dragOffset.x;
        // Drag-n-drop bounds checking
        let isOutOfBounds: boolean = false;
        if(left < this.dragMinimumLeft) {
            left = this.dragMinimumLeft;
            isOutOfBounds = true;
        }
        if(left + domDraggedHandle.getWidth() > this.dragMaximumRight) {
            left = this.dragMaximumRight - domDraggedHandle.getWidth();
            isOutOfBounds = true;
        }
        // Adjust position by the nearest "positioned" element it is relative to
        const parentBounds = domDraggedHandle.getOffsetParent().getBounds();
        left = left - parentBounds.left;
        // Set the position
        domDraggedHandle.left(left);

        return !isOutOfBounds;
    }

    private handleCompletionRequest() {
        if(this.fromIndex !== this.toIndex) {
            this.eventManager.triggerEvent("onTabReorder", {from: this.fromIndex, to: this.toIndex});
        }
        this.clenaUp();
    }

    private handleCancelRequest() {
        this.eventManager.triggerEvent("onCancelled");
        this.clenaUp();
    }

    private handleUndockRequested() {
        this.eventManager.triggerEvent("onUndockRequest");
        this.clenaUp();
    }

    private checkUndock(event: MouseEvent): boolean {
        if(this.checkUndockRequest === false)
            return false;
        const boundsTabStrip = this.tabStrip.getDOM().getBoundingClientRect();
        return event.pageX < boundsTabStrip.left || event.pageY < boundsTabStrip.top ||
                event.pageX > boundsTabStrip.right || event.pageY > boundsTabStrip.bottom;
    }

    private checkTabReorderToLeft(): boolean {
        if(this.toIndex === 0)
            return false;
        const checkedToIndex =  this.indexMap.mapToReordered(this.toIndex - 1);
        const boundsDraggedHandle = this.domTabHandles[this.fromIndex].getBounds();
        const checkedHandleBounds = this.domTabHandles[checkedToIndex].getBounds();
        const middlePointTrigger = checkedHandleBounds.left + checkedHandleBounds.width / 2;
        return boundsDraggedHandle.left <= middlePointTrigger;
    }

    private checkTabReorderToRight(): boolean {
        if(this.toIndex >= this.domTabHandles.length - 1)
            return false;
        const checkedToIndex = this.indexMap.mapToReordered(this.toIndex + 1);
        const boundsDraggedHandle = this.domTabHandles[this.fromIndex].getBounds();
        const checkedHandleBounds = this.domTabHandles[checkedToIndex].getBounds();
        const middlePointTrigger = checkedHandleBounds.left + checkedHandleBounds.width / 2;
        return boundsDraggedHandle.right >= middlePointTrigger;
    }

    private translateTabHandleToLeft() {
        this.lastAnimation?.commit();

        let translatedTabHandleIndex = this.toIndex;
        let neighbourIndex = translatedTabHandleIndex - 2;  
        translatedTabHandleIndex = this.indexMap.mapToReordered(translatedTabHandleIndex);
        if(neighbourIndex >= 0) {
            neighbourIndex = this.indexMap.mapToReordered(neighbourIndex);
        }

        const domTranslatedHandle = this.domTabHandles[translatedTabHandleIndex];
        
        let newLeft;
        if(neighbourIndex < 0) {
            newLeft = this.tabStrip.getDOM().getBoundingClientRect().left;
        } else {
            const boundsNeighbourHandle = this.domTabHandles[neighbourIndex].getBounds();
            newLeft = boundsNeighbourHandle.right;
        }

        // Adjust position by the nearest "positioned" element it is relative to
        const parentBounds = domTranslatedHandle.getOffsetParent().getBounds();
        newLeft = newLeft - parentBounds.left;

        this.lastAnimation = AnimationHelper.animateTabReorderTranslation(domTranslatedHandle.getElement(), newLeft);
    }

    private translateTabHandleToRight() {
        this.lastAnimation?.commit();

        let translatedTabHandleIndex = this.toIndex;
        let neighbourIndex = translatedTabHandleIndex + 2;  
        translatedTabHandleIndex = this.indexMap.mapToReordered(translatedTabHandleIndex);
        if(neighbourIndex >= this.domTabHandles.length) {
            neighbourIndex = -1;
        }

        if(neighbourIndex >= 0) {
            neighbourIndex = this.indexMap.mapToReordered(neighbourIndex);
        }

        const domTranslatedHandle = this.domTabHandles[translatedTabHandleIndex];
        const boundsTranslateHandle = domTranslatedHandle.getBounds();

        let newLeft;
        if(neighbourIndex < 0) {
            newLeft = this.dragMaximumRight - boundsTranslateHandle.width;
        } else {
            const boundsNeighbourHandle = this.domTabHandles[neighbourIndex].getBounds();
            newLeft = boundsNeighbourHandle.left - boundsTranslateHandle.width
        }
        
        // Adjust position by the nearest "positioned" element it is relative to
        const parentBounds = domTranslatedHandle.getOffsetParent().getBounds();
        newLeft = newLeft - parentBounds.left;

        this.lastAnimation = AnimationHelper.animateTabReorderTranslation(domTranslatedHandle.getElement(), newLeft);
    }

    /**
     *  IEventEmitter wrappers for event handling
     */
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.eventManager.subscribe(eventName, handler);
    }

    off(eventName: string): void {
        return this.eventManager.unsubscribeAll(eventName);

    }
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.eventManager.subscribeOnce(eventName, handler);
    }
}
