import { DockLayoutEngine } from "./DockLayoutEngine";
import { IDeltaPoint, IDeltaRect, IDockContainer, IPoint, IRect } from "./common/declarations";
import { EventKind, EventPayload } from "./common/events-api";
import { IPanelAPI, ISubscriptionAPI } from "./common/panel-api";
import { PanelContainer } from "./containers/PanelContainer";
import { DockWheel } from "./docking-wheel/DockWheel";
import { Dialog } from "./floating/Dialog";
import { ComponentEventManager } from "./framework/component-events";
import { DockManagerContext } from "./model/DockManagerContext";
import { DockModel } from "./model/DockModel";
import { DockNode } from "./model/DockNode";
import { TabPage } from "./tabview/TabPage";


/**
 * DOCUMENT API
 * DOCUMENTED METHOD VS. UNDOCUMENTED METHODS
 */
export class DockManager {

    private defaultDialogPosition: IPoint = {x: 0, y: 0};

    // DockManager Model
    private context: DockManagerContext;
    // Layouting Engine
    private layoutEngine: DockLayoutEngine;
    // Dock Wheel Manager Class
    private dockWheel: DockWheel;

    // Active Document & Panel Management
    private activePanel: PanelContainer;
    private activeDocument: PanelContainer;

    // DockManager Event Manager
    private eventManager: ComponentEventManager;

    constructor(private container: HTMLElement, private _config: any = {}) {
        // TODO: MANAGE INITIAL OPTIONS - POPULATE WITH DEFAULTS        
    }

    initialize() {
        // Create initial empty Dock Model
        this.context = new DockManagerContext(this);
        const documentNode = new DockNode(this.context.documentManagerView);
        this.context.model.setRootNode(documentNode);
        this.context.model.setDocumentManagerNode(documentNode);
        this.setRootNode(this.context.model.rootNode);

        // Initialize other internals
        this.eventManager = new ComponentEventManager();
        this.dockWheel = new DockWheel(this);

        // Resize to the container
        this.resize(this.container.clientWidth, this.container.clientHeight);
        // TODO: CREATE DOCK WHEEL
        this.layoutEngine = new DockLayoutEngine(this);

        this.rebuildLayout(this.context.model.rootNode);

        // TODO: INITIALIZE Z-INDEX COUNTERS
    }

    /**
     * SIMPLE QUERY METHODS
     */

    get config(): any {
        return this._config;
    }

    // TODO: FURTHER METHOD IMPLEMENTATIONS
    getContainerBoundingRect(): DOMRect {
        throw 0;
    }

    queryPanelAPI(panelName: string): IPanelAPI {
        throw 0;
    }


    getDialogRootElement(): HTMLElement {
        throw 0;
    }



    getModelContext(): DockManagerContext {
        throw 0;
    }

    /**
     * FACTORY METHODS
     */

    // TODO: DOCUMENT OR PANEL, SINGLETON OR MULTIPLE, FACTORY METHOD
    // TODO: INTRODUCE PANEL TYPE REGISTRY
    registerPanelType(panelTypeName: string) {

    }

    // IN CASE OF SINGLETON RETURNS THE SAME INSTANCE - IF FOUND IN THE REGISTRY
    createPanel(panelTypeName: string, options: any = {}): PanelContainer {
        throw 0;
    }

    /**
     * Docking Facilities & Wrapper Methods
     */

    dockLeft(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockLeft(refNode, newNode);
        }, false, ratio);              
    }

    dockRight(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockRight(refNode, newNode);
        }, true, ratio);              
    }

    dockUp(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockUp(refNode, newNode);
        }, false, ratio);       
    }

    dockDown(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockDown(refNode, newNode);
        }, true, ratio);
    }

    dockFill(referenceNode: DockNode, container: PanelContainer) {
        this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockFill(refNode, newNode);
        }, false);
    }

    dockDialogLeft(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockLeft(refNode, newNode);
        });                             
    }

    dockDialogRight(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockRight(refNode, newNode);
        });                      
    }

    dockDialogUp(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockUp(refNode, newNode);
        });              
    }

    dockDialogDown(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockDown(refNode, newNode);
        });       
    }

    dockDialogFill(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockFill(refNode, newNode);
        });
    }

    // TODO: COMPLEX IMPLEMENTATION
    private requestDockContainer(
        referenceNode: DockNode, container: IDockContainer, 
        layoutFn: (referenceNode: DockNode, newNode: DockNode) => void,
        dockedToPrevious: boolean, ratio?: number
    ) {

    }

    // TODO: COMPLEX IMPLEMENTATION
    private requestDockDialog(
        referenceNode: DockNode, dialog: Dialog, 
        layoutFn: (referenceNode: DockNode, newNode: DockNode) => void
    ) {

    }

    isMoveInsideContainer(element: HTMLElement, delta: IDeltaPoint): boolean {
        const boundsElement = element.getBoundingClientRect();
        const rectElement: IRect = {
            x: boundsElement.left + delta.dx,
            y: boundsElement.top + delta.dy,
            w: boundsElement.width,
            h: boundsElement.height
        };
        return this.isRectInsideContainer(rectElement);
    }

    isResizeInsideContainer(element: HTMLElement, delta: IDeltaRect) {
        const boundsElement = element.getBoundingClientRect();
        const rectElement: IRect = {
            x: boundsElement.left + delta.dx,
            y: boundsElement.top + delta.dy,
            w: boundsElement.width + delta.dw,
            h: boundsElement.height + delta.dh
        };
        return this.isRectInsideContainer(rectElement);
    }

    private isRectInsideContainer(rect: IRect): boolean {
        const rectContainer = this.container.getBoundingClientRect();
        return rectContainer.left < rect.x && rectContainer.top < rect.y &&
            rect.x + rect.w < rectContainer.right && rect.y + rect.h < rectContainer.bottom;
    }

    rebuildLayout(node: DockNode) {
        node.childNodes.forEach(childNode => this.rebuildLayout(childNode));
        node.performLayout(false);
    }

    invalidate() {
        this.resize(this.container.clientWidth, this.container.clientHeight);
    }

    
    private resize(width: number, height: number) {
        this.context.model.rootNode.container.resize(width, height);

        // TODO: POSITION DIALOGS TO THE CONTAINER VIEWPORT - WHEN THE BROWSER WINDOW GETS SMALLER
    }

    // TODO: WILL BE USED IN THE PERSPECTIVE SWITCH, KEEP MODELS CACHED
    setModel(model: DockModel) {
        this.context.documentManagerView.getDOM().remove();
        this.context.setModel(model);
        this.setRootNode(model.rootNode);

        this.rebuildLayout(model.rootNode);
        this.loadResize(model.rootNode);

    }

    private loadResize(node: DockNode) {
        node.childNodes.reverse().forEach(childNode => {
            this.loadResize(childNode);
            node.container.setActiveChild(childNode.container);
        });
        // TODO: GET SAVED STATE OF WIDTH AND HEIGHT AND RESIZE ACCORDINDLY
        //node.container.resize()
    }

    setRootNode(rootNode: DockNode) {
        rootNode.detachFromParent();
        this.context.model.setRootNode(rootNode);
        this.container.appendChild(rootNode.container.getDOM());
    }

    /**
     * Dock Wheel Management
     */

    private bindDialogDragEvents(dialog: Dialog) {
        dialog.on("onDragStart", ({sender, event}) => this.handleDialogDragStarted(sender, event));
        dialog.on("onDragMove", ({sender, event}) => this.handleDialogDragged(sender, event));
        dialog.on("onDragStop", ({sender, event}) => this.handleDialogDragEnded(sender, event));
    }

    private handleDialogDragStarted(sender: Dialog, event: MouseEvent) {
        const activeNode = this.findNodeOnPoint({x: event.pageX, y: event.pageY});        
        this.dockWheel.setActiveDialog(sender);
        this.dockWheel.setActiveNode(activeNode);

        this.dockWheel.showWheel();
    }

    private handleDialogDragged(sender: Dialog, event: MouseEvent) {
        const activeNode = this.findNodeOnPoint({x: event.pageX, y: event.pageY});        
        this.dockWheel.setActiveNode(activeNode);
    }

    private handleDialogDragEnded(sender: Dialog, event: MouseEvent) {
        this.dockWheel.onDialogDropped(sender);
        this.dockWheel.hideWheel();

        // TODO: WHY TO SAVE STATE OF DIALOG OFFSET????
        // sender.saveState(sender.elementDialog.offsetLeft, sender.elementDialog.offsetTop);
    }

    private findNodeOnPoint(point: IPoint): DockNode {
        const stack = [this.context.model.rootNode];
        let bestMatch = null;

        while(stack.length > 0) {
            const topNode = stack.pop();

            if(this.isPointInsideNode(point, topNode)) {
                bestMatch = topNode;
                topNode.childNodes.forEach(childNode => stack.push(childNode));
            }
        }

        return bestMatch;
    }

    // TODO: MOVE TO HELPER
    private isPointInsideNode(point: IPoint, node: DockNode): boolean {
        const element = node.container.getDOM();
        const rect = element.getBoundingClientRect();

        return rect.x < point.x && rect.y < point.y && point.x < rect.right && point.y < rect.bottom;
    }


    /**
     * TODO - OTHER MISSING IMPLEMENTATION
     */


    // TODO: COMPLEX IMPLEMENTATION
    floatDialog() {

    }

    requestTabReorder(container: IDockContainer, e: any) {
        // TODO: COMPLETE THIS
    }

    requestUndockToDialog(container: PanelContainer, event: MouseEvent, dragOffset: IPoint): Dialog {
        const node = this.findNodeFromContainer(container);
        this.layoutEngine.undock(node);

        // TODO: FIND A BETTER WAY TO DO THIS - IS IT NECESSARY?
        node.container.getDOM().style.display = "block";

        // TODO: CHECK CONTAINER IS PANEL CONTAINER
        const panelContainer: PanelContainer = node.container as PanelContainer;;

        // Construt the dialog
        const dialog = new Dialog(this, panelContainer, null, false);
        this.bindDialogDragEvents(dialog);

        const lastDialogSize = panelContainer.getLastDialogSize();
        if(lastDialogSize) {
            dialog.resize(lastDialogSize.w, lastDialogSize.h);
        }

        // TODO: WHAT IS THE REASON FOR THIS DIALOG PLACING??? 
        // TODO: REFACTOR TO A SPECIAL METHOD, USED TWICE AT LEAST
        if(event != null) {
            const dialogWidth = dialog.getPanel().getWidth();
            if(dragOffset.x > dialogWidth) {
                dragOffset.x = 0.75 * dialogWidth;
            }
            dialog.setPosition(event.pageX - dragOffset.x, event.pageY - dragOffset.y);
            // TODO: INVOKE onMouseMove on Draggable - FIND BETTER WAY THEN INVOKE MOUSE MOVE HANDLER
        }

        return dialog;
    }

    requestClose(container: PanelContainer) {
        const node = this.findNodeFromContainer(container);
        this.layoutEngine.close(node);
        if(this.activePanel === container) {
            this.activePanel = null;
        }
        if(this.activeDocument === container) {
            const lastDocument = this.activeDocument;
            this.activeDocument = null;
            // TODO: NOTIFY ACTIVE DOCUMENT CHANGED
        }
    }

    openInDialog(container: PanelContainer, event: MouseEvent, dragOffset: IPoint, disableResize: boolean) {
        const dialog = new Dialog(this, container, null, disableResize);
        this.bindDialogDragEvents(dialog);

        if(event !== null) {
            const dialogWidth = dialog.getPanel().getWidth();
            if(dragOffset.x > dialogWidth) {
                dragOffset.x = 0.75 * dialogWidth;
            }
            dialog.setPosition(event.pageX - dragOffset.x, event.pageY - dragOffset.y);
            // TODO: INVOKE onMouseMove on Draggable - FIND BETTER WAY THEN INVOKE MOUSE MOVE HANDLER
        }
        return dialog;
    }


    requestUndock(container: PanelContainer) {
        const node = this.findNodeFromContainer(container);
        this.layoutEngine.undock(node);
    }

    requestRemove(container: PanelContainer): DockNode {
        const node = this.findNodeFromContainer(container);
        const parent = node.parent;
        node.detachFromParent();
        if(parent) {
            this.rebuildLayout(parent);
        }
        return node;
    }

    findNodeFromContainer(container: IDockContainer): DockNode {
        return this.findNodeFromContainerElement(container.getDOM());
    }

    findNodeFromContainerElement(element: HTMLElement): DockNode {
        const stack: DockNode[] = [this.context.model.rootNode];

        while(stack.length > 0) {
            const topNode = stack.pop();
            if(topNode.container.getDOM().isSameNode(element))
                return topNode;
            topNode.childNodes.forEach(childNode => stack.push(childNode));
        }

        return null;
    }

    /**
     * Active Panel & Document Management
     */
 
    getActivePanel(): PanelContainer {
        return this.activePanel;
    }

    getActiveDocument(): PanelContainer {
        return this.activeDocument;
    }

    /**
     * TODO: REWORK
     */
    setActivePanel(panel: PanelContainer) {
        if(this.activePanel !== panel) {
            /**
             * 1. Zjistit posledni aktivni panel, ktery neni dialog
             * 2. Uchovat si posledni aktivni panel
             * 3. Deaktivovat posledni aktivni panel, odejmout CSS a TabPage, pokud existuje 
             *      (aktivita, ne selection)
             * 4. Nastavit aktivni panel
             * 5. Uchovat posledni dokument
             *      Pokud je posledni panel Dokument, nastavit jej
             * 6. Nejaky kod pro poslednim aktivnim panelem - CO TO JE?
             * 7. NOTIFIKACE O ZMENE PANELU, POKUD ZMENA DOKUMENTU, NOTIFIKACE O ZMENE DOKUMENTU
             * 8. Pokud je hodnota aktivniho panelu?
             *      1) NASTAVIT CSS NA HEADER AKTIVNIHO PANELU
             *      2) NASTAVIT TABPAGE V TABHOSTu JAKO ACTIVE, POKUD JE V PARENT FILL DOCKERU
             */
        } else {
            // TODO: SET ACTIVE PANEL IN THE TABHOST - IS IT NECESSARY????
        }
    }

    /**
     * DockManager Event Handling & Notification Facilities
     */

    listenTo<K extends EventKind>(eventName: K, handler:(payload: EventPayload<K>) => void): ISubscriptionAPI {
        return this.eventManager.subscribe(eventName, handler);
    }

    private triggerEvent<K extends EventKind>(eventName: K, payload: EventPayload<K>): void {
        this.eventManager.triggerEvent(eventName, payload);
    }

    suspendLayout(panel: IDockContainer) {
        this.triggerEvent("onSuspendLayout", {dockManager: this, container: panel});
    }

    resumeLayout(panel: IDockContainer) {
        this.triggerEvent("onResumeLayout", {dockManager: this, container: panel});
    }

    notifyOnDock(node: DockNode) {
        this.triggerEvent("onDock", {dockManager: this, node: node});      
    }

    notifyOnUnDock(node: DockNode) {
        this.triggerEvent("onUndock", {dockManager: this, node: node});      
    }

    notifyOnTabReorder(node: DockNode) {
        this.triggerEvent("onTabReorder", {dockManager: this, node: node});      
    }

    notifyOnClosePanel(panel: PanelContainer) {
        this.triggerEvent("onClosePanel", {dockManager: this, panel: panel});      
    }

    notifyOnCreateDialog(dialog: Dialog) {
        this.triggerEvent("onCreateDialog", {dockManager: this, dialog: dialog});      
    }

    notifyOnShowDialog(dialog: Dialog) {
        this.triggerEvent("onShowDialog", {dockManager: this, dialog: dialog});      
    }

    notifyOnHideDialog(dialog: Dialog) {
        this.triggerEvent("onHideDialog", {dockManager: this, dialog: dialog});      
    }

    notifyOnChangeDialogPosition(dialog: Dialog, x: number, y: number) {
        this.triggerEvent("onChangeDialogPosition", {
            dockManager: this, 
            dialog: dialog,
            position: { x: x, y: y }
        });      
    }

    notifyOnContainerResized(dockContainer: IDockContainer) {
        this.triggerEvent("onContainerResized", {dockManager: this, container: dockContainer});      
    }   
    
    notifyOnTabChange(tabPage: TabPage) {
        this.triggerEvent("onTabChange", {dockManager: this, tabPage: tabPage});      
    }

    notifyOnActivePanelChange(panel: PanelContainer, oldActive: PanelContainer) {
        this.triggerEvent("onActivePanelChange", {
            dockManager: this, 
            previousActivePanel: oldActive,
            activePanel: panel
        });      
    }
    
    notifyOnActiveDocumentChange(panel: PanelContainer, oldActive: PanelContainer) {
        this.triggerEvent("onActiveDocumentChange", {
            dockManager: this, 
            previousActivePanel: oldActive,
            activePanel: panel
        });      
    }   
    
    /**
     * PERSISTENCE API
     */

    saveState(): string {
        throw 0;
    }

    async loadState(json: string) {

    }

    /**
     * MISC HELPER METHODS
     */

    getPanels() {}

    undockEnabled(state: boolean) {

    }

    lockDockState(state: boolean) {

    }

    hideCloseButton(state: boolean) {

    }

    // TODO: IS THIS USEFUL FOR ANYTHING?
    updatePanels(ids: string[]) {

    }

    getVisiblePanels(): PanelContainer[] {
        throw 0;
    }

    // TODO: IS THIS USEFUL FOR ANYTHING?
    _allPanels(node: DockNode, panels: PanelContainer[]) {

    }

    nextDialogZIndex(): number {
        throw 0;
    }

    getWheelZIndex(): number {
        throw 0;
    }
    
}