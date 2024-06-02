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
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../core/panel-default-buttons";
import { PanelStateMachine } from "./panel-state/PanelStateMachine";
import { Dialog } from "../floating/Dialog";
import { DetectionMode, DragAndDrop } from "../utils/DragAndDrop";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";

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


    // Icon & Title State
    private _iconHtml: string = "";
    private _title: string = "";
    private _hasChanges: boolean = false;


    private _isVisible: boolean = false;

    private contentPanelMouseDown: DOMEvent<MouseEvent>;

    protected state: PanelStateMachine;

    private previousContentZIndex: number;
    private _loadedSize: ISize;

    constructor(
        protected  dockManager: DockManager, 
        private panelTypeName: string,
        private api: IGenericPanelAPI
    ) {
        super();
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

    getPlaceholderDOM() {
        return this.domPanelPlaceholder;
    }
    
    isHidden(): boolean {
        return ! this._isVisible;
    }

    setVisible(visible: boolean): void {
        this._isVisible = visible;
        if(visible) {
            // TODO: DEBUG
            this.domContentFrame.show();
            DOMUpdateInitiator.forceEnqueuedDOMUpdates();
            const rect = this.domPanelPlaceholder.getBoundingClientRect();
            this.domContentFrame.applyRect(rect);   
        } else {
            this.domContentFrame.hide();
        }
    }

    isHeaderVisible() {
        return this.domContentFrame.hasClass("DockerTS-ContentFrame--NoHeader") === false;
    }

    setHeaderVisibility(visible: boolean): void {
        if(visible) {
            this.domFrameHeader.show();
            this.domContentFrame.removeClass("DockerTS-ContentFrame--NoHeader");
        } else {
            this.domFrameHeader.hide();
            this.domContentFrame.addClass("DockerTS-ContentFrame--NoHeader");
        }
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

    // Note: PanelContainer is leaf node, no child active selection
    setActiveChild(container: IDockContainer): void {}

    activatePanel() {
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
        return this.api.getMinHeight?.() ?? this.dockManager.config.defaultMinHeight;
    }

    expandPanel() {
        this.activatePanel();
        this.state.expand();
    }

    collapsePanel() {
        this.activatePanel();
        this.state.collapse();
    }

    restorePanel() {
        this.activatePanel();
        this.state.restore();
    }

    minimizePanel() {
        this.state.minimize();
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
        this.state.resize(rect);
    }

    invalidate() {
        const bounds = this.domContentFrame.getComputedRect();
        this.resize(bounds);
    }

    // PanelContainer is leaf node => no layouting logic
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {}

    updateLayoutState(): void {
        this.state.updateLayoutState();
    }

    updateContainerState() {
        this.state.updatePanelState();
    }

    onDraggingStarted() {
        this.previousContentZIndex = this.getContentFrameDOM().getZIndex();
        const zIndexWheel = this.dockManager.config.zIndexes.zIndexWheel;
        this.getContentFrameDOM().addClass("DockerTS-ContentFrame--Dragging").zIndex(zIndexWheel);
    }

    onDraggingEnded() {
        this.getContentFrameDOM()
            .removeClass("DockerTS-ContentFrame--Dragging")
            .zIndex(this.previousContentZIndex);
    }

    /**
     * Misc Methods
     */


    public setContentElement(content: HTMLElement) {
        this.domContent?.remove();
        this.domContent = content;
        this.domContentHost?.appendChild(this.domContent);

        this.contentPanelMouseDown?.unbind();
        this.contentPanelMouseDown = new DOMEvent(this.domContentHost.get());
        this.contentPanelMouseDown.bind("mousedown", this.handleMouseDownOnPanel.bind(this), {capture: true});
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

    showHeaderButton(actionName: string, flag: boolean): void {
        if(flag) {
            this.buttonBar.allowAction(actionName);
        } else {
            this.buttonBar.denyAction(actionName);
        }
    }

    private handleButtonAction(actionName: string) {
        if(actionName === PANEL_ACTION_COLLAPSE) {
            this.collapsePanel();
        } else if(actionName === PANEL_ACTION_EXPAND) {
            this.expandPanel();
        } else if(actionName === PANEL_ACTION_MAXIMIZE) {
            this.maximizePanel();
        } else if(actionName === PANEL_ACTION_RESTORE) {
            this.restorePanel();
        } else if(actionName === PANEL_ACTION_MINIMIZE) {
            this.minimizePanel();
        }
    }

    /**
     * Framework Component Callbacks
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
            .hide().appendTo(this.domContentFrame);
        this.domTitle = DOM.create("div").addClass("DockerTS-HeaderTitleBar");
        this.domTitleText = DOM.create("div");

        // Create the Header Button Bar
        this.buttonBar = new PanelButtonBar();
        this.buttonBar.on("onAction", this.handleButtonAction.bind(this));

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

        this.bind(this.domContentFrame.get(), "mousedown", this.handleMouseDownOnPanel.bind(this));

        this.state = new PanelStateMachine(this.dockManager, this, PanelContainerState.Docked);

        this.updateTitle();
        this.updateContainerState();
        this.updateLayoutState();

        return this.domPanelPlaceholder.get();
    }
    
    protected onUpdate(element: HTMLElement): void {}

    /**
     * Persistence Management
     */

    static async loadFromState(state: IState, dockManager: DockManager): Promise<PanelContainer> {
        const api = dockManager.gainPanelApiContract(state.panelName);
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
     * Dock & Undock Facilities - TO BE DONE
     */

    canUndock(flag?: boolean): boolean {
        return true;
    }

    async requestUndockToDialog(event: MouseEvent, dragOffset: IPoint): Promise<Dialog> {
        const dialog = this.dockManager.requestUndockToDialog(this, event, dragOffset);
        await this.state.floatPanel(dialog);
        return dialog;
    }

    performUndock() {
        this.dockManager.requestUndock(this);
    }

    async prepareForDocking() {
        // if(this.domDialogFrame) {
        //     this.panelPlaceholderRO.unobserve(this.domDialogFrame);
        // }
        this.dockManager.getContainerElement().appendChild(this.domContentFrame.get());
        await this.state.dockPanel();
        // this.containerState = PanelContainerState.Docked;
        this.updateContainerState();
    }

    /**
     * Closing Facilities - TODO: TO BE DONE
     */

    async close(): Promise<boolean> {
        const canClose = (await this.api.canClose?.()) ?? true
        if(! canClose) {
            return false;
        }
        
        await this.api.onClose?.();
        this.closeInternal();

        return true;
    }

    private async closeInternal() {
        this.domContentContainer.removeFromDOM();
        // TODO: FLOATING DIALOG SHOULD CLOSE
        this.triggerEvent("onClose");
        // TODO: TRY AND CATCH IN THE TRIGGER EVENT AND API CALLS?
        this.dockManager.notifyOnClosePanel(this);
        this.performClose();
    }
    
    // TODO: REWORK
    private performClose() {
        //this.domContentWrapper.css("display", "block");
        this.domContentContainer.css("display", "none");
        this.domPanelPlaceholder.css("position", "");
        this.dockManager.requestClose(this);
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
                if(isUndockStarted === false) {
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
        this.triggerEvent("onFocused");
        this.activatePanel();
    }

    private handleContextMenuClick(event: MouseEvent) {
        event.preventDefault();

        const contextMenuConfig = new ContextMenuConfig();
        this.api.onQueryContextMenu?.(contextMenuConfig);
        if(contextMenuConfig.getMenuItems().length === 0)
            return;

        const zIndexContextMenu = this.dockManager.config.zIndexes.zIndexContextMenu;
        const domContextMenu = new ContextMenu(contextMenuConfig);
        domContextMenu.on("onAction", (actionName) => {
            this.api.onActionInvoked?.(actionName);
        });
        domContextMenu.show(event, zIndexContextMenu);
    }

    private handleMouseFocusEvent(event: MouseEvent) {
        // this.triggerEvent("onFocused");
    }
}
