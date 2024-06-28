import { DockManager } from "../facade/DockManager";
import { PanelStateAdapter } from "../api/PanelStateAdapter";
import { PanelState } from "../api/PanelState";
import { IDockContainer } from "../common/declarations";
import { IContextMenuAPI, IGenericPanelAPI, IHeaderButton, IPanelAPI } from "../common/panel-api";
import { IState } from "../common/serialization";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { ContainerType, PanelContainerState } from "../common/enumerations";
import { IPoint, IRect, ISize } from "../common/dimensions";
import { PanelButtonBar } from "../core/PanelButtonBar";

import "./PanelContainer.css";
import { DOMEvent } from "../framework/dom-events";
import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { ContextMenu } from "../core/ContextMenu";
import { PANEL_ACTION_CLOSE, PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE, PANEL_ACTION_SHOW_POPUP, PANEL_ACTION_TOGGLE_PIN, isPanelDefaultAction } from "../core/panel-default-buttons";
import { PanelStateMachine } from "./panel-state/PanelStateMachine";
import { Dialog } from "../floating/Dialog";
import { DetectionMode, DragAndDrop } from "../utils/DragAndDrop";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";
import { ContextMenuFactory } from "./ContextMenuFactory";
import { EventHelper } from "../utils/event-helper";
import { ArrayUtils } from "../utils/ArrayUtils";

export class PanelContainer extends Component implements IDockContainer {

    private domContent: HTMLElement;

    // Frame for panel content - header & content
    private domContentFrame: DOM<HTMLElement>;
    // Container Element for panel content provided by the client code
    private domContentContainer: DOM<HTMLElement>;
    // Content Host holding the clinet content out of document flow
    private domContentHost: DOM<HTMLElement>;
    
    // Wrapper element for panel header
    private domFrameHeader: DOM<HTMLElement>;
    // Wrapper element for title
    private domTitle: DOM<HTMLElement>;
    // Wrapper element for title text
    private domTitleText: DOM<HTMLElement>;
    
    // Placeholder element for measuring size in Docked State
    private domPanelPlaceholder: DOM<HTMLElement>;

    private buttonBar: PanelButtonBar;

    private _isDefaultContextMenuEnabled = true;
    private _isProcessingDefaultAction = false;


    // Icon & Title State
    private _iconHtml: string = "";
    private _title: string = "";
    private _hasChanges: boolean = false;


    private _isVisible: boolean = false;

    private contentPanelMouseDown: DOMEvent<MouseEvent>;

    protected state: PanelStateMachine;

    private deniedActionsByUser: string[] = [];
    private actionsAllowedByState: string[] = [];

    private previousContentZIndex: number;
    private _loadedSize: ISize;

    constructor(
        protected  dockManager: DockManager, 
        private panelTypeName: string,
        private api: IGenericPanelAPI
    ) {
        super();
        this.handleContextMenuAction = this.handleContextMenuAction.bind(this);
        this.initializeComponent();
    }

    getAPI(): IGenericPanelAPI {
        return this.api;
    }

    /**
     * Panel Icon & Title Management
     */

    getTitleHtml(): string {
        return this.domTitle.getHtml();
    }

    setTitle(title: string) {
        this._title = title;
        this.updateTitle();
    }

    getTitle(): string {
        return this._title;
    }

    getTitleIcon(): string {
        return this._iconHtml;
    }

    setTitleIcon(iconHtml: string) {
        this._iconHtml = iconHtml;
        this.updateTitle();
    }

    hasChanges(): boolean {
        return this._hasChanges;
    }

    setHasChanges(flag: boolean) {
        this._hasChanges = flag;
        this.updateTitle();
    }

    private updateTitle() {
        this.domTitle.html(this._iconHtml);
        this.domTitleText.addClass("DockerTS-HeaderTitleText").text(this._title).appendTo(this.domTitle);

        this.triggerEvent("onTitleChanged", this.getTitleHtml());
    }

    /**
     * Misc Query and Helper Methods
     */

    queryLoadedSize(): ISize {
        return {...this._loadedSize};
    }

    getDockManager(): DockManager {
        return this.dockManager;
    }

    getContentFrameDOM() {
        return this.domContentFrame;
    }

    getContentContainerDOM() {
        return this.domContentContainer;
    }

    getFrameHeaderDOM() {
        return this.domFrameHeader;
    }

    getContentHostDOM() {
        return this.domContentHost;
    }

    getPlaceholderDOM() {
        return this.domPanelPlaceholder;
    }
    
    isHidden(): boolean {
        return ! this._isVisible;
    }

    setVisible(visible: boolean): void {
        this._isVisible = visible;
        if(visible) {
            this.domContentFrame.show();
            this.updateState();
        } else {
            this.domContentFrame.hide();
        }
    }

    isHeaderVisible() {
        return this.domContentFrame.hasClass("DockerTS-ContentFrame--NoHeader") === false;
    }

    setHeaderVisibility(visible: boolean): void {
        if(visible) {
            this.domFrameHeader.css("visibility", "");
            this.domContentFrame.removeClass("DockerTS-ContentFrame--NoHeader");
        } else {
            this.domFrameHeader.css("visibility", "collapse");
            this.domContentFrame.addClass("DockerTS-ContentFrame--NoHeader");
        }
    }

    enableDefaultContextMenu(flag: boolean) {
        this._isDefaultContextMenuEnabled = flag;
    }

    isDefaultContextMenuEnabled(): boolean {
        return this._isDefaultContextMenuEnabled;
    }

    getContainerType(): ContainerType {
        return ContainerType.Panel;
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        return this.api.onQueryContextMenu?.(config);
    }

    handleContextMenuAction(actionName: string): void {
        this.api.onActionInvoked?.(actionName);
    }

    // Leaf Node - minimum child count is zero
    getMinimumChildNodeCount(): number {
        return 0;
    }

    getChildContainers(): IDockContainer[] {
        return [];
    }


    // Note: PanelContainer is leaf node, no child active selection
    setActiveChild(container: IDockContainer): void {}

    activatePanel() {
        this.triggerEvent("onFocused");
        this.dockManager.setActivePanel(this);
    }

    /**
     * Dimensions Query & Resizing / Layouting
     */

    getPosition(): IPoint {
        const bounds = this.domContentFrame.getBoundsRect();
        return {x: bounds.x, y: bounds.y};
    }

    getWidth(): number {
        const bounds = this.domContentFrame.getBoundsRect();
        return bounds.w;
    }

    getHeight(): number {
        const bounds = this.domContentFrame.getBoundsRect();
        return bounds.h;
    }

    getMinWidth(): number {
        return this.api.getMinWidth?.() ?? this.dockManager.config.defaultMinWidth;
    }

    getMinHeight(): number {
        let minHeight = this.api.getMinHeight?.() ?? this.dockManager.config.defaultMinHeight;
        // If the panel header is visible, we need to add it up to the minimum height
        if(this.isHeaderVisible()) {
            minHeight += this.domFrameHeader.getOffsetRect().h;
        }
        return minHeight;
    }

    async expandPanel() {
        this.activatePanel();
        await this.state.expand();
    }

    async collapsePanel() {
        this.activatePanel();
        await this.state.collapse();
    }

    async restorePanel() {
        this.activatePanel();
        await this.state.restore();
    }

    async minimizePanel() {
        await this.state.minimize();
    }

    async showPopupWindow() {
        this.activatePanel();
        await this.state.showPopup();
    }

    async hidePopupWindow() {
        await this.state.hidePopup();
    }

    async togglePinState() {
        if(this.state.getCurrentState() === PanelContainerState.InCollapser) {
            await this.state.pinPanel()
        } else {
            await this.state.unpinPanel();
        }
    }

    toggleMaximizedPanelState() {
        if(this.state.getCurrentState() === PanelContainerState.Maximized) {
            this.restorePanel();
        } else {
            this.maximizePanel();
        }
    }

    maximizePanel() {
        this.activatePanel();
        this.state.maximize();
    }

    resize(rect: IRect): void {
        // this.state.resize(rect);
    }

    invalidate() {
        const bounds = this.domContentFrame.getComputedRect();
        this.resize(bounds);
    }

    // PanelContainer is leaf node => no layouting logic
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {}

    updateState() {
        this.state.updateState();
    }

    updateLayout(rect?: IRect): void {
        this.state.updateLayout(rect);
    }

    onDraggingStarted() {
        this.getContentFrameDOM().addClass("DockerTS-ContentFrame--Dragging");
    }

    onDraggingEnded() {
        this.getContentFrameDOM().removeClass("DockerTS-ContentFrame--Dragging");
    }

    /**
     * Content Element Manipulation Methods
     */

    public setContentElement(content: HTMLElement) {
        // First check, if the content element is NOT the same
        // Note: we do not want to cause flickering when there is not the reason to do so
        if(this.domContent === content && this.domContent.parentElement === content.parentElement)
            return;

        // If not so and we need to change the elements, perform the change of content elements
        this.domContent?.remove();
        this.domContent = content;
        this.domContentHost?.appendChild(this.domContent);

        // Release and bind again the panel mouse down handler for its activation purposes
        this.contentPanelMouseDown?.unbind();
        this.contentPanelMouseDown = new DOMEvent(this.domContentHost.get());
        this.contentPanelMouseDown.bind("mousedown", this.handleMouseDownOnPanel.bind(this), {capture: true});
    }

    public removeContentElement() {
        this.contentPanelMouseDown?.unbind();
        this.domContent.remove();
        this.domContent = undefined;
    }

    public getContentElement(): HTMLElement {
        return this.domContent;
    }

    public getHeaderElement(): HTMLElement {
        return this.domTitle.get();
    }

    /**
     *  Header Button Management
     */

    addHeaderButton(button: IHeaderButton): void {
        this.buttonBar.appendUserButton(button);
    }

    removeHeaderButton(actionName: string): void {
        this.buttonBar.removeUserButton(actionName);
    }

    allowAction(actionName: string): void {
        if(this.deniedActionsByUser.includes(actionName)) {
            ArrayUtils.removeItem(this.deniedActionsByUser, actionName);
        }
        const flag = this.isActionAllowed(actionName);
        if(flag) {
            this.buttonBar.allowAction(actionName);
        } else {
            this.buttonBar.denyAction(actionName);
        }
    }

    denyAction(actionName: string): void {        
        if(this.deniedActionsByUser.includes(actionName) === false) {
            this.deniedActionsByUser.push(actionName);
        }
        const flag = this.isActionAllowed(actionName);
        if(flag) {
            this.buttonBar.allowAction(actionName);
        } else {
            this.buttonBar.denyAction(actionName);
        }
    }

    isActionDeniedByUser(actionName: string) {
        return this.deniedActionsByUser.includes(actionName);
    }

    showHeaderButton(actionName: string, flag: boolean): void {
        if(flag) {            
            this.buttonBar.allowAction(actionName);
        } else {
            this.buttonBar.denyAction(actionName);
        }
    }

    setActionAllowedByState(actionName: string, flag: boolean): void {
        if(flag === true) {
            if(this.actionsAllowedByState.includes(actionName) === false) {
                this.actionsAllowedByState.push(actionName);
            }
        } else {
            if(this.actionsAllowedByState.includes(actionName)) {
                ArrayUtils.removeItem(this.actionsAllowedByState, actionName);
            }
        }
    }

    isActionAllowedByState(actionName: string) {
        return this.actionsAllowedByState.includes(actionName);
    }

    isActionAllowed(actionName: string): boolean {
        if(actionName === PANEL_ACTION_TOGGLE_PIN) {
            if(this.dockManager.config.enableCollapsers === false) {
                return false;
            }
        } else if(actionName === PANEL_ACTION_SHOW_POPUP) {
            if(this.dockManager.config.enablePopupWindows === false) {
                return false;
            }
        }
        return this.isActionAllowedByState(actionName) && this.isActionDeniedByUser(actionName) === false;
    }

    async handleDefaultPanelAction(actionName: string) {
        // We need to prevent multiple asynchronous calls for default action processing
        if(this._isProcessingDefaultAction)
            return;
        this._isProcessingDefaultAction = true;

        if(actionName === PANEL_ACTION_COLLAPSE) {
            await this.collapsePanel();
        } else if(actionName === PANEL_ACTION_EXPAND) {
            await  this.expandPanel();
        } else if(actionName === PANEL_ACTION_MAXIMIZE) {
            await this.maximizePanel();
        } else if(actionName === PANEL_ACTION_RESTORE) {
            await this.restorePanel();
        } else if(actionName === PANEL_ACTION_MINIMIZE) {
            await this.minimizePanel();
        } else if(actionName === PANEL_ACTION_CLOSE) {
            await this.close();
        } else if(actionName === PANEL_ACTION_SHOW_POPUP) {
            await this.showPopupWindow();
        } else if(actionName === PANEL_ACTION_TOGGLE_PIN) {
            await this.togglePinState();
        }

        this._isProcessingDefaultAction = false;
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {
        this._iconHtml = "";
        this._hasChanges = false;
        this._title = this.dockManager.config.defaultPanelLabel;
    }

    protected onDisposed(): void {
        this.contentPanelMouseDown.unbind();

        this.state.dispose();
        this.buttonBar.dispose();
    }

    protected onInitialRender(): HTMLElement {
        // Create the content wrapper frame
        this.domContentFrame = DOM.create("div").addClass("DockerTS-ContentFrame");
        // Create the panel header
        this.domFrameHeader = DOM.create("div").addClass("DockerTS-FrameHeader")
            .appendTo(this.domContentFrame);
        this.domTitle = DOM.create("div").addClass("DockerTS-HeaderTitleBar");
        this.domTitleText = DOM.create("div");

        // Create the Header Button Bar
        this.buttonBar = new PanelButtonBar(this.dockManager);
        this.buttonBar.on("onAction", this.handleDefaultPanelAction.bind(this));

        this.domFrameHeader.appendChild(this.domTitle);
        this.domFrameHeader.appendChild(this.buttonBar.getDOM());
        this.bind(this.domFrameHeader.get(), "dblclick", () => {
            this.toggleMaximizedPanelState();
        });
        this.bind(this.domFrameHeader.get(), "mousedown", this.handleMouseDownOnHeader.bind(this));
        this.bind(this.domFrameHeader.get(), "contextmenu", this.handleContextMenuClick.bind(this));

        // Create the content container
        this.domContentContainer = DOM.create("div").addClass("DockerTS-ContentContainer")
                .appendTo(this.domContentFrame);
        this.domContentHost = DOM.create("div").addClass("DockerTS-ContentHost")
                .appendTo(this.domContentContainer);
                
        this.bind(this.domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        this.dockManager.getContainerElement().appendChild(this.domContentFrame.get());

        this.domPanelPlaceholder = DOM.create("div").attr("tabIndex", "-1")
                .addClass("DockerTS-PanelPlaceholder").cacheBounds(false);

        this.bind(this.domContentFrame.get(), "pointerdown", this.handleMouseDownOnPanel.bind(this), {capture: true});

        this.state = new PanelStateMachine(this.dockManager, this, PanelContainerState.Docked);

        this.setHeaderVisibility(false);
        this.updateTitle();
        this.updateState();

        return this.domPanelPlaceholder.get();
    }
    
    protected onUpdate(element: HTMLElement): void {}

    /**
     * Persistence Management
     */

    static async loadFromState(state: IState, dockManager: DockManager): Promise<PanelContainer> {
        const api = dockManager.createNewPanelApiContract(state.panelName);
        const container = new PanelContainer(dockManager, state.panelName, api);
        const contentElement = await api.initialize(new PanelStateAdapter(container), null);
        container.setContentElement(contentElement);
        container.loadState(state);
        return container;
    }

    saveState(state: IState): void {
        // Save the state of the Panel Container
        state.panelName = this.panelTypeName;
        state.width = this.getWidth();
        state.height = this.getHeight();

        // Save the client state of the panel itself
        const panelClientState = new PanelState();
        this.api.saveState?.(panelClientState);
        state.panelClientState = panelClientState.getState();
    }

    loadState(state: IState) {
        // Load Panel State 
        this._loadedSize = {
            w: state.width,
            h: state.height
        };
        this.panelTypeName = state.panelName;

        // Load the client panel state        
        const panelClientState = new PanelState(state.panelClientState ?? {});
        this.api.loadState?.(panelClientState);
    }

    /**
     * Dock & Undock Facilities
     */

    canUndock(flag?: boolean): boolean {
        return true;
    }

    async requestUndockToDialog(event: MouseEvent, dragOffset: IPoint): Promise<Dialog> {
        const dialog = this.dockManager.requestUndockToDialog(this, event, dragOffset);
        await this.state.floatPanel(dialog);
        return dialog;
    }

    performDock(dockingFn: () => void) {
        this.state.dockPanel(dockingFn);
    }


    performUndock() {
        this.dockManager.requestUndock(this);
    }

    // async prepareForDocking() {
    //     // if(this.domDialogFrame) {
    //     //     this.panelPlaceholderRO.unobserve(this.domDialogFrame);
    //     // }
    //     // this.dockManager.getContainerElement().appendChild(this.domContentFrame.get());
    //     // this.containerState = PanelContainerState.Docked;
    //     //this.updateState();
    // }

    // async onAfterDock() {
    //     await this.state.dockPanel();
    // }

    /**
     * Closing Facilities
     */

    async close(): Promise<boolean> {
        const canClose = (await this.api.canClose?.()) ?? true
        if(! canClose) {
            return false;
        }
        
        this.performClose();

        return true;
    }

    async performClose(shouldRequestClone: boolean = true) {
        // Invoke API if present for instance to unmount React component
        await this.api.onClose?.();
        // Trigger for dialog close + some states need to react this
        this.triggerEvent("onClose");
        // Relayout the DockManager after closing the panel
        if(shouldRequestClone) {
            this.dockManager.requestClose(this);
        }
        // Remove the DOM ndoes
        this.domContent.remove();
        this.domContentHost.removeFromDOM();
        this.domContentFrame.removeFromDOM();
        // Do final destroy
        this.destroy();
    }

    destroy() {
        this.dispose();
    }

    /**
     * Event Handlers
     */

    private handleMouseDownOnHeader(event: MouseEvent) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.triggerEvent("onFocused");

        const initialPosition: IPoint = {
            x: event.pageX,
            y: event.pageY
        };
        let dialog: Dialog;

        if(this.state.getCurrentState() === PanelContainerState.Docked) {
            let isUndockStarted = false;
            DragAndDrop.start(event, async (event) => {
                if(isUndockStarted === false && this.dockManager.config.enableUndock === true) {
                    isUndockStarted = true;
                    const headerBounds = this.domFrameHeader.getBoundsRect();
                    const dragOffset: IPoint = {
                        x: initialPosition.x - headerBounds.x,
                        y: initialPosition.y - headerBounds.y
                    };
        
                    dialog = await this.requestUndockToDialog(event, dragOffset);
                    this.triggerEvent("onDockingDragStart", event);
                } else {
                    this.triggerEvent("onDockingDragMove", event);
                }
            }, (event) => {
                this.triggerEvent("onDockingDragStop", event);
            }, "pointer", () => {}, DetectionMode.withThreshold);
        }
    }

    private handleMouseDownOnPanel(event: MouseEvent) {
        console.log("CAPTURED PANEL");
        this.triggerEvent("onFocused");
        this.activatePanel();
    }

    private handleContextMenuClick(event: MouseEvent) {
        event.preventDefault();

        let contextMenuConfig;
        if(this._isDefaultContextMenuEnabled) {
            contextMenuConfig = ContextMenuFactory.createDefaultContextMenu(this);
        } else {
            contextMenuConfig = new ContextMenuConfig();
        }

        this.api.onQueryContextMenu?.(contextMenuConfig);
        if(contextMenuConfig.getMenuItems().length === 0)
            return;

        const zIndexContextMenu = this.dockManager.config.zIndexes.zIndexContextMenu;
        const domContextMenu = new ContextMenu(contextMenuConfig);
        domContextMenu.on("onAction", (actionName) => {
            if(isPanelDefaultAction(actionName)) {
                this.handleDefaultPanelAction(actionName);
            } else {
                this.api.onActionInvoked?.(actionName);
            }
        });
        domContextMenu.show(event, zIndexContextMenu);
    }

    private handleMouseFocusEvent(event: MouseEvent) {
        // this.triggerEvent("onFocused");
    }
}
