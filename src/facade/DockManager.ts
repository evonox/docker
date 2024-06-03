import { DockLayoutEngine } from "./DockLayoutEngine";
import {  IDeltaPoint, IDeltaRect, IPoint, IRect } from "../common/dimensions";
import { EventKind, EventPayload } from "../common/events-api";
import { IChannel, IPanelAPI, ISubscriptionAPI, ITabbedPanelAPI, PanelFactoryFunction, TabbedPanelFactoryFunction, ViewInstanceType } from "../common/panel-api";
import { PanelContainer } from "../containers/PanelContainer";
import { DockWheel } from "../docking-wheel/DockWheel";
import { Dialog } from "../floating/Dialog";
import { ComponentEventManager } from "../framework/component-events";
import { DockManagerContext } from "../model/DockManagerContext";
import { DockModel } from "../model/DockModel";
import { DockNode } from "../model/DockNode";
import { TabPage } from "../tabview/TabPage";
import { DockPanelTypeRegistry } from "./DockPanelTypeRegistry";
import { PanelInitConfig } from "../api/PanelInitConfig";
import { PanelStateAdapter } from "../api/PanelStateAdapter";
import * as _ from "lodash-es";
import { DOCK_CONFIG_DEFAULTS, IDockConfig } from "../common/configuration";
import { SplitterDockContainer } from "../splitter/SplitterDockContainer";
import { ContainerType, OrientationKind } from "../common/enumerations";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { DragAndDrop } from "../utils/DragAndDrop";
import { ChannelManager } from "./ChannelManager";
import { TabbedPanelContainer } from "../containers/TabbedPanelContainer";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";
import { DebugHelper } from "../utils/DebugHelper";


/**
 * The main DockManager Library facade class
 */
export class DockManager {

    private defaultDialogPosition: IPoint = {x: 0, y: 0};

    // DockManager Model
    private context: DockManagerContext;
    // Layouting Engine
    private layoutEngine: DockLayoutEngine;
    // Dock Wheel Manager Class
    private dockWheel: DockWheel;
    // Dock Panel Type Registry
    private panelTypeRegistry: DockPanelTypeRegistry;

    // Active Document & Panel Management
    private activePanel: PanelContainer;
    private activeDocument: PanelContainer;

    // DockManager Event Manager
    private eventManager: ComponentEventManager;

    // Channel Manager
    private channelManager: ChannelManager;

    // Resize Observer
    private resizeObserver: ResizeObserver;

    // Z-Index Counters
    private lastZIndex: number;
    private lastDialogZIndex: number;

    // Minimized Window Support
    private lastMinimizedSlotId = 0;
    private minimizedSlots: number[] = [];

    constructor(private container: HTMLElement, private _config: IDockConfig = {}) {
        this._config = _.defaultsDeep({}, DOCK_CONFIG_DEFAULTS, this._config);
        DOM.from(this.container).css("position", "relative")
            .css("display", "grid")
            .css("overflow", "hidden")
            .cacheBounds(false);

        // Lets contrain the resize logic to double rate than FPS to prevent flickering
        this.handleContainerResized = _.throttle(this.handleContainerResized.bind(this),
            1000 / (this.config.dragAndDropFrameRate * 2), {leading: true, trailing: true}
        );
        
        DragAndDrop.initialize(
            this.config.zIndexes.zIndexDragAndDropBlocker,
            this.config.dragAndDropFrameRate
        );
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
        this.channelManager = new ChannelManager();
        this.dockWheel = new DockWheel(this);
        this.layoutEngine = new DockLayoutEngine(this);
        this.panelTypeRegistry = new DockPanelTypeRegistry();

        // Initialize ResizeObserver
        this.resizeObserver = new ResizeObserver(() => {
            this.handleContainerResized();
        });
        this.resizeObserver.observe(this.container, {box: "border-box"});

        // Init other MISC attributes
        this.lastZIndex = this.config.zIndexes.zIndexCounter;
        this.lastDialogZIndex = this.config.zIndexes.zIndexDialogCounter;

        // Resize to the container
        this.rebuildLayout(this.context.model.rootNode);
        this.invalidate();
    }

    /**
     * Misc Basic Query Methods
     */

    get config(): Readonly<IDockConfig> {
        return this._config;
    }

    getContainerBoundingRect(): DOMRect {
        return this.container.getBoundingClientRect();
    }

    getContainerElement(): HTMLElement {
        return this.container;
    }

    getModelContext(): DockManagerContext {
        return this.context;
    }

    genNextZIndex(): number {
        return this.lastZIndex++;
    }

    genNextDialogZIndex(): number {
        return this.lastDialogZIndex++;
    }

    getWheelZIndex(): number {
        return this.config.zIndexes.zIndexWheel;
    }

    getDocumentNode(): DockNode {
        return this.context.model.documentManagerNode;
    }

    getChannel(name?: string): IChannel {
        return this.channelManager.getChannel(name);
    }

    getLayoutEngine(): DockLayoutEngine {
        return this.layoutEngine;
    }

    /**
     * Panel Type Management
     */

    gainPanelApiContract(panelTypeName: string): IPanelAPI {
        if(this.panelTypeRegistry.isPanelTypeRegistered(panelTypeName) === false)
            throw new Error(`ERROR: Panel Type with name ${panelTypeName} is not registered.`);
        // We get metadata about the panel type
        const metadata = this.panelTypeRegistry.getPanelTypeMetadata(panelTypeName);      
        // Fetch the panel API contract
        return metadata.factoryFn(this) as IPanelAPI;
    }

    registerPanelType(
        panelTypeName: string,instanceType: ViewInstanceType, factoryFn: PanelFactoryFunction
    ): void {
        if(this.panelTypeRegistry.isPanelTypeRegistered(panelTypeName) === true)
            throw new Error(`ERROR: Panel Type with name ${panelTypeName} is ALREADY not registered.`);

        this.panelTypeRegistry.registerPanelType({
            name: panelTypeName, instanceType: instanceType, factoryFn: factoryFn
        });
    }

    registerTabbedPanelType(
        panelTypeName: string,instanceType: ViewInstanceType, factoryFn: TabbedPanelFactoryFunction
    ): void {
        if(this.panelTypeRegistry.isPanelTypeRegistered(panelTypeName) === true)
            throw new Error(`ERROR: Panel Type with name ${panelTypeName} is ALREADY not registered.`);

        this.panelTypeRegistry.registerPanelType({
            name: panelTypeName, instanceType: instanceType, factoryFn: factoryFn
        });
    }

    async createPanel(panelTypeName: string, options: any = {}): Promise<PanelContainer> {
        if(this.panelTypeRegistry.isPanelTypeRegistered(panelTypeName) === false)
            throw new Error(`ERROR: Panel Type with name ${panelTypeName} is not registered.`);
        
        // We get metadata about the panel type
        const metadata = this.panelTypeRegistry.getPanelTypeMetadata(panelTypeName);      
        // If it is singleton and has already an instance, we return it
        if(metadata.instanceType === "singleton" && this.panelTypeRegistry.hasPanelTypeAnyInstances(panelTypeName)) {
            return this.panelTypeRegistry.getViewInstances(panelTypeName)[0];
        }
        // Invoke the factory function to get the panel contract
        const panelTypeContract = metadata.factoryFn(this) as IPanelAPI;
        // Create the panel container
        const panelContainer = new PanelContainer(this, panelTypeName, panelTypeContract);        
        // Invoke the constructor function
        const initOptions = new PanelInitConfig(options);
        const apiAdapter = new PanelStateAdapter(panelContainer);
        const domContentElement = await panelTypeContract.initialize(apiAdapter, initOptions);
        panelContainer.setContentElement(domContentElement);
        
        // Return finally the panel container
        return panelContainer;
    }

    async createTabbedPanel(panelTypeName: string, options: any = {}): Promise<TabbedPanelContainer> {
        if(this.panelTypeRegistry.isPanelTypeRegistered(panelTypeName) === false)
            throw new Error(`ERROR: Panel Type with name ${panelTypeName} is not registered.`);
        
        // We get metadata about the panel type
        const metadata = this.panelTypeRegistry.getPanelTypeMetadata(panelTypeName);      
        // If it is singleton and has already an instance, we return it
        if(metadata.instanceType === "singleton" && this.panelTypeRegistry.hasPanelTypeAnyInstances(panelTypeName)) {
            return this.panelTypeRegistry.getViewInstances(panelTypeName)[0] as TabbedPanelContainer;
        }
        // Invoke the factory function to get the panel contract
        const panelTypeContract = metadata.factoryFn(this) as ITabbedPanelAPI;
        // Create the panel container
        const panelContainer = new TabbedPanelContainer(this, panelTypeName, panelTypeContract);        
        // Invoke the constructor function
        const initOptions = new PanelInitConfig(options);
        const apiAdapter = new PanelStateAdapter(panelContainer);
        await panelTypeContract.initialize(apiAdapter, initOptions);
        
        // Return finally the panel container
        return panelContainer;
    }


    /**
     * Docking Facilities & Wrapper Methods
     */

    dockLeft(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        return this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockLeft(refNode, newNode);
        }, false, ratio);              
    }

    dockRight(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        return this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockRight(refNode, newNode);
        }, true, ratio);              
    }

    dockUp(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        return this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockUp(refNode, newNode);
        }, false, ratio);       
    }

    dockDown(referenceNode: DockNode, container: PanelContainer, ratio: number) {
        return this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockDown(refNode, newNode);
        }, true, ratio);
    }

    dockFill(referenceNode: DockNode, container: PanelContainer) {
        return this.requestDockContainer(referenceNode, container, (refNode, newNode) => {
            this.layoutEngine.dockFill(refNode, newNode);
        }, false);
    }

    dockDialogLeft(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockLeft(refNode, newNode);
        }, 0.5, false);                             
    }

    dockDialogRight(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockRight(refNode, newNode);
        }, 0.5, true);                      
    }

    dockDialogUp(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockUp(refNode, newNode);
        }, 0.5, true);              
    }

    dockDialogDown(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockDown(refNode, newNode);
        }, 0.5, true);       
    }

    dockDialogFill(referenceNode: DockNode, dialog: Dialog) {
        this.requestDockDialog(referenceNode, dialog, (refNode, newNode) => {
            this.layoutEngine.dockFill(refNode, newNode);
        }, 1, false);
    }

    floatDialog(container: PanelContainer, rect: IRect) {
        // TODO: CHECK DIALOG DOES NOT EXIST, THEN SHOW
        // TODO: UNDOCK IF THE CONTAINER IS DOCKED

        const dialog = new Dialog(this, container);
        dialog.setPosition(rect.x, rect.y);
        dialog.resize(rect);
        this.bindDialogDragEvents(dialog);

        return dialog;
    }

    /**
     * Minimized Slot Management
     */

    requestMinimizeSlot(): number {
        const slotId = this.lastMinimizedSlotId++;
        this.minimizedSlots.unshift(slotId);
        this.recomputeMinimizedSlotsCSS();
        return slotId;
    }

    releaseMinimizeSlot(slotId: number) {
        const index = this.minimizedSlots.indexOf(slotId);
        if(index >= 0) {
            this.minimizedSlots.splice(index, 1);
            this.recomputeMinimizedSlotsCSS();
            this.updateLayoutState();
        }
    }

    getNextFreeMinimizedSlotRect(): IRect {
        const containerRect = this.getContainerBoundingRect();
        const windowWidth = this.config.minimizedWindowWidth;
        const windowHeight = this.config.minimizedWindowHeight;
        return {
            x: containerRect.right - windowWidth * (this.minimizedSlots.length + 1),
            y: containerRect.bottom - windowHeight,
            w: windowWidth,
            h: windowHeight
        };
    }

    private recomputeMinimizedSlotsCSS() {
        // Set the window width
        const windowWidth = this.config.minimizedWindowWidth;
        DOM.from(this.container).css("--docker-ts-minimized-width", windowWidth.toFixed(0) + "px");
        // Compute offsets of the slots
        let offsetRight = 0;
        for(let i = this.minimizedSlots.length - 1; i >= 0; i--) {
            const slotId = this.minimizedSlots[i];
            const cssVariableName = this.getSlotCSSPropertyName(slotId);
            DOM.from(this.container).css(cssVariableName, offsetRight.toFixed(0) + "px");
            offsetRight += windowWidth;
        }
    }

    getSlotCSSPropertyName(slotId: number) {
        return `--docker-ts-slot-${slotId}`;
    }

    // TODO: REFACTOR IT
    private requestDockContainer(
        referenceNode: DockNode, container: IDockContainer, 
        layoutFn: (referenceNode: DockNode, newNode: DockNode) => void,
        dockedToPrevious: boolean, ratio?: number
    ) {
        const newNode = new DockNode(container);
        if(container.getContainerType() === ContainerType.Panel) {
            const panel = container as PanelContainer;
            panel.prepareForDocking();
            // TODO: FIND THE CORRECT PLACE FOR THIS OPERATION
            panel.getDOM().remove();
        }

        // Get original ratios and splitter - for further computations
        let ratios: number[] = null;
        let oldSplitter: SplitterDockContainer;
        if(referenceNode.parent && referenceNode.parent.container) {
            oldSplitter = referenceNode.parent.container as SplitterDockContainer;
            ratios = oldSplitter.getRatios();
        }

        // Perform Dock Layout
        layoutFn(referenceNode, newNode);

        // Update correct ratios
        if(ratio && newNode.parent 
            && (
                newNode.parent.container.getContainerType() === ContainerType.ColumnLayout ||
                newNode.parent.container.getContainerType() === ContainerType.RowLayout
            )
        ) {
            const splitter = newNode.parent.container as SplitterDockContainer;
            if(ratios && splitter === oldSplitter) {
                if(dockedToPrevious) {
                    for(let i = 0; i < ratios.length; i++) {
                        ratios[i] = ratios[i] + ratios[i] * ratio;
                    }
                    ratios.push(ratio);
                } else {
                    ratios[0] = ratios[0] - ratio;
                    ratios.unshift(ratio);
                }
                splitter.setRatios(ratios);
            } else {
                splitter.setContainerRatio(container, ratio);
            }
        }

        // Refresh Layout
        this.rebuildLayout(this.context.model.rootNode);
        this.invalidate();

        return newNode;
    }

    private async requestDockDialog(
        referenceNode: DockNode, dialog: Dialog, 
        layoutFn: (referenceNode: DockNode, newNode: DockNode) => void,
        ratio: number, dockedToPrevious: boolean
    ) {
        const panel = dialog.getPanel();
        const newNode = new DockNode(panel);
        await panel.prepareForDocking();
        // TODO: RESET ELEMENT CONTENT CONTAINER Z-INDEX - MOVE SOMEWHERE
        dialog.destroy();

        // Get original ratios and splitter - for further computations
        let ratios: number[] = null;
        let oldSplitter: SplitterDockContainer;
        if(referenceNode.parent && referenceNode.parent.container.getContainerType() !== ContainerType.FillLayout) {
            oldSplitter = referenceNode.parent.container as SplitterDockContainer;
            ratios = oldSplitter.getRatios();   
        }

        // TODO: ORIENTATION
        const dockBounds = this.layoutEngine.getDockBounds(referenceNode, panel, OrientationKind.Row, dockedToPrevious);

        layoutFn(referenceNode, newNode);

        // Update correct ratios
        if(ratio && newNode.parent 
            && (
                newNode.parent.container.getContainerType() === ContainerType.ColumnLayout ||
                newNode.parent.container.getContainerType() === ContainerType.RowLayout
            )
        ) {
            // TODO: ORIENTATION
            const splitter = newNode.parent.container as SplitterDockContainer;
            const size = this.layoutEngine.getVaryingDimension(splitter, OrientationKind.Row);
            splitter.setContainerRatio(panel, dockBounds.w / size);
            return;

            if(ratios && splitter === oldSplitter) {
                if(dockedToPrevious) {
                    for(let i = 0; i < ratios.length; i++) {
                        ratios[i] = ratios[i] + ratios[i] * ratio;
                    }
                    ratios.push(ratio);
                } else {
                    ratios[0] = ratios[0] - ratio;
                    ratios.unshift(ratio);
                }
                splitter.setRatios(ratios);
            } else {
                splitter.setContainerRatio(panel, ratio);
            }
        }

        // Refresh Layout
        this.rebuildLayout(this.context.model.rootNode);
        this.invalidate();

        return newNode;
    }

    /**
     * Constraint checks the moved dialog is inside the DockerTS Viewport
     */

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
        const startTime = DebugHelper.startMeasuring();
        // We force any pending updates before resizing the layout
        DOMUpdateInitiator.forceAllEnqueuedUpdates();
        // Get the current container bounds and resize the dock layout accordingly
        const rect = DOM.from(this.container).getBoundsRect();
        this.resize(rect);
        DOMUpdateInitiator.forceAllEnqueuedUpdates();

        DebugHelper.stopMeasuring(startTime, "DockMananager::invalidate()");
    }

    private updateContainerState() {
        this.context.model.rootNode.container.updateContainerState();
        for(const dialog of this.context.model.dialogs) {
            dialog.getPanel().updateContainerState();
        }
    }

    private updateLayoutState() {
        this.context.model.rootNode.container.updateLayoutState();
        for(const dialog of this.context.model.dialogs) {
            dialog.getPanel().updateLayoutState();
        }
    }

    private handleContainerResized() {
        this.invalidate();
    }
    
    private resize(rect: IRect) {
        // this.context.model.rootNode.container.resize(rect);

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

    private isPointInsideNode(point: IPoint, node: DockNode): boolean {
        const element = node.container.getDOM();
        const rect = element.getBoundingClientRect();

        return rect.x < point.x && rect.y < point.y && point.x < rect.x + rect.width && point.y < rect.y + rect.height;
    }


    /**
     * TODO - OTHER MISSING IMPLEMENTATION
     */


    requestTabReorder(container: IDockContainer, e: any) {
        // TODO: COMPLETE THIS
    }

    requestUndockToDialog(container: PanelContainer, event: MouseEvent, dragOffset: IPoint): Dialog {
        const node = this.findNodeFromContainer(container);
        this.layoutEngine.undock(node);

        // TODO: CHECK CONTAINER IS PANEL CONTAINER
        const panelContainer: PanelContainer = node.container as PanelContainer;;

        // Construct the dialog
        const dialog = new Dialog(this, panelContainer);
        this.bindDialogDragEvents(dialog);

        // const lastDialogSize = panelContainer.getLastDialogSize();
        // if(lastDialogSize) {
        //     dialog.resize(lastDialogSize.w, lastDialogSize.h);
        // }

        // TODO: WHAT IS THE REASON FOR THIS DIALOG PLACING??? 
        // TODO: REFACTOR TO A SPECIAL METHOD, USED TWICE AT LEAST
        if(event != null) {
            const dialogWidth = dialog.getPanel().getWidth();
            // if(dragOffset.x > dialogWidth) {
            //     dragOffset.x = 0.75 * dialogWidth;
            // }
            console.dir("SETTING DIALOG POSITION");
            console.dir(dragOffset);
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
        const dialog = new Dialog(this, container);
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
            this.activePanel = panel;
            this.updateContainerState();
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
}
