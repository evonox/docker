import { DockManager } from "../facade/DockManager";
import { PanelStateAdapter } from "../api/PanelStateAdapter";
import { PanelState } from "../api/PanelState";
import { IDockContainer } from "../common/declarations";
import { IContextMenuAPI, IHeaderButton, IPanelAPI } from "../common/panel-api";
import { IState } from "../common/serialization";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { ContainerType, PanelContainerState, PanelType } from "../common/enumerations";
import { IPoint, IRect, ISize } from "../common/dimensions";
import { PanelButtonBar } from "../core/PanelButtonBar";

import "./PanelContainer.css";
import { DOMEvent } from "../framework/dom-events";
import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { ContextMenu } from "../core/ContextMenu";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_RESTORE } from "../core/panel-default-buttons";
import { AnimationHelper } from "../utils/animation-helper";

export class PanelContainer extends Component implements IDockContainer {

    // private domContentHost: DOM<HTMLElement>;

    // private domMaximizeRegionHost: DOM<HTMLElement>;

    // private domContentWrapper: DOM<HTMLElement>;
    private domContent: HTMLElement;



    // Frame for panel content - header & content
    private domContentFrame: DOM<HTMLElement>;
    // Container Element for panel content provided by the client code
    private domContentContainer: DOM<HTMLElement>;
    
    // Wrapper element for panel header
    private domFrameHeader: DOM<HTMLElement>;
    // Wrapper element for title
    private domTitle: DOM<HTMLElement>;
    // Wrapper element for title text
    private domTitleText: DOM<HTMLElement>;
    
    // Placeholder element for measuring size in Docked State
    private domPanelPlaceholder: DOM<HTMLElement>;
    private panelPlaceholderRO: ResizeObserver;
    


    private domDialogFrame: HTMLElement;

    private domGrayingPlaceholder: HTMLElement;

    private buttonBar: PanelButtonBar;

    // Panel Container State
    private containerState: PanelContainerState;
    private isCollapsed: boolean = false;

    private wasVisibleHeaderBeforeMaximization: boolean;
    private previousContainerState: PanelContainerState;

    // Icon & Title State
    private _iconHtml: string = "";
    private _title: string = "";
    private _hasChanges: boolean = false;

    // Dimensions & Resizing State
    private _lastDialogSize: ISize;
    private _lastExpandedHeight: number;
    private _lastFloatingRect: IRect;
    private _lastZIndex: number;

    private _isVisible: boolean = false;

    private contentPanelMouseDown: DOMEvent<MouseEvent>;

    constructor(
        private dockManager: DockManager, 
        private panelTypeName: string,
        private api: IPanelAPI,
        private panelType: PanelType
    ) {
        super();
        this.initializeComponent();
    }
    queryLoadedSize(): ISize {
        throw new Error("Method not implemented.");
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

    getDockManager(): DockManager {
        return this.dockManager;
    }

    getContentFrameDOM() {
        return this.domContentFrame;
    }

    getFrameHeaderDOM() {
        return this.domFrameHeader;
    }
    
    isHidden(): boolean {
        return ! this._isVisible;
    }

    setVisible(visible: boolean): void {
        this._isVisible = visible;
        if(visible) {
            this.domContentFrame.show();
            this.updateContentLayout();
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
        const bounds = this.domContentFrame.getBounds();
        return {x: bounds.left, y: bounds.y};
    }

    getWidth(): number {
        const bounds = this.domContentFrame.getBounds();
        return bounds.width;
    }

    getHeight(): number {
        const bounds = this.domContentFrame.getBounds();
        return bounds.height;
    }

    getMinWidth(): number {
        return this.api.getMinWidth?.() ?? this.dockManager.config.defaultMinWidth;
    }

    getMinHeight(): number {
        return this.api.getMinHeight?.() ?? this.dockManager.config.defaultMinHeight;
    }

    setDialogPosition(x: number, y: number) {
        //this.domPanel.left(x).top(y);
        // this.domContentContainer.left(x).top(y + this.domFrameHeader.getHeight());
        const bounds = this.domDialogFrame.getBoundingClientRect();
        this.domContentFrame.left(x).top(y).width(bounds.width).height(bounds.height);
    }

    setPanelDimensions(width: number, height: number) {
        this.domContentFrame.width(width).height(height);
        //this.domPanelPlaceholder.width(width).height(heigth);
    }

    setPanelZIndex(zIndex: number) {
        this.domContentContainer.css("z-index", String(zIndex));
    }

    getLastDialogSize(): ISize {
        return {...this._lastDialogSize};
    }

    saveLastDialogSize(size: ISize) {
        this._lastDialogSize = {...size};
    }

    expandPanel() {
        if(this.containerState !== PanelContainerState.Floating)
            return;
        if(! this.isCollapsed)
            return;
        this.isCollapsed = false;
        this.domContentContainer.height(this._lastExpandedHeight);

        this.triggerEvent("onExpanded");
    }

    collapsePanel() {
        if(this.containerState !== PanelContainerState.Floating)
            return;
        if(this.isCollapsed)
            return;
        this._lastExpandedHeight = this.domContentContainer.getHeight();
        this.isCollapsed = true;

        this.domContentContainer.height(0);
        this.triggerEvent("onCollapsed");
    }

    restorePanel() {
        if(this.containerState !== PanelContainerState.Maximized)
            return;
        // Note: can be floating, minimized or docked

        if(this.previousContainerState === PanelContainerState.Docked 
            || this.previousContainerState === PanelContainerState.Minimized) {
            this.containerState = PanelContainerState.Docked;
            this.domContentFrame.zIndex("");

            const originalBounds = this.domPanelPlaceholder.getBounds();

            // AnimationHelper.animatePosition(this.domContentFrame.get(), {
            //     x: originalBounds.left, y: originalBounds.y, w: originalBounds.width, h: originalBounds.height
            // }).then(() => {
            //     this.domContentFrame.zIndex("");
            // });
    

        } else if(this.previousContainerState === PanelContainerState.Floating) {
            // TODO: TO BE DONE
        }
        this.setHeaderVisibility(this.wasVisibleHeaderBeforeMaximization);
        this.updateLayoutState();
        
        // this.domPanelPlaceholder.css("z-index", String(this._lastZIndex))
        //     .left(this._lastFloatingRect.x).top(this._lastFloatingRect.y)
        //     .width(this._lastFloatingRect.w).height(this._lastFloatingRect.h);
    }

    // TODO: In Future support maximizing from more states.
    maximizePanel() {
        if(this.containerState === PanelContainerState.Maximized)
            return;
        this.previousContainerState = this.containerState;
        this.wasVisibleHeaderBeforeMaximization = this.isHeaderVisible();

        this.domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)
        this.containerState = PanelContainerState.Maximized;

        const containerBounds = this.dockManager.getContainerBoundingRect();
        this.setHeaderVisibility(true);
        this.updateLayoutState();
        // AnimationHelper.animateMaximize(this, {
        //     x: containerBounds.left, y: containerBounds.y, w: containerBounds.width, h: containerBounds.height
        // }).then(() => {
        //     this.setHeaderVisibility(true);   
        // });



        // const panelBounds = this.domPanel.getBounds();
        // this._lastFloatingRect = {
        //     x: panelBounds.left, y: panelBounds.y, w: panelBounds.width, h: panelBounds.height
        // };
        // this._lastZIndex = parseInt(this.domPanel.getCss("z-index"));

        // const containerBounds = this.dockManager.getContainerBoundingRect();
        // const zIndexMaximizedPanel = this.dockManager.config.zIndexes.zIndexMaximizedPanel;
        // this.domMaximizeRegionHost.applyRect(containerBounds).zIndex(zIndexMaximizedPanel)
        //     .appendChild(this.domFrameHeader).appendChild(this.domContentContainer)
        //     .appendTo(document.body);

        // TODO: TEMP JS RESIZING
        // this.domFrameHeader.width(containerBounds.width);
        // this.domContentContainer.width(containerBounds.width).height(containerBounds.height - this.domFrameHeader.getHeight())
        //     .left(containerBounds.left).top(this.domFrameHeader.getHeight());

        // const containerBounds = this.dockManager.getContainerBoundingRect();
        // this.setDialogPosition(containerBounds.x, containerBounds.y);
        // this.resize(containerBounds.width, containerBounds.height);
        // this.domPanel.left(containerBounds.left).top(containerBounds.top)
        //     .width(containerBounds.width).height(containerBounds.height)
        //     .css("z-index", String(zIndexMaximizedPanel));
    }

    /**
     * RECALCULATE SIZE OF INTERNALS - NOTIFY ON RESIZE THE PANEL
     * REMOVE JS DIMENSION CALCULATION AS MUCH AS POSSIBLE
     */
    resize(width: number, height: number): void {
        // TEMP SOLUTION
        // this.domPanelPlaceholder.width(width).height(height);

        // TODO: COULD BE LAYOUT BY CSS GRID / FLEX???
        // this.domPanelPlaceholder.width(width);
        //this.domFrameHeader.width(width); // Note: Add Place for Buttons, or layout by CSS
        // this.domContentHost.width(width);
        // this.domContentFrame.width(width);

        // const titleBarHeight = this.domTitle.getHeight();
        // const contentHeight = height - titleBarHeight;
        // this.domContentHost.height(contentHeight);
        // this.domContentContainer.height(contentHeight);
        // this.domContentWrapper.height(contentHeight);
        // this.domPanelPlaceholder.height(height);
        // this.domContentFrame.height(height);

        // const boundsDockingContainer = this.dockManager.getContainerBoundingRect();
        // const boundsContentWrapper = this.domPanelPlaceholder.getBounds();
        // this.domContentFrame.applyRect(boundsContentWrapper);
        // this.domContentContainer.left(boundsContentWrapper.left - boundsDockingContainer.left)
        //     .top(boundsContentWrapper.top - boundsDockingContainer.top)
        //     .width(boundsContentWrapper.width).height(boundsContentWrapper.height);
    }

    // PanelContainer is leaf node => no layouting logic
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {}

    updateLayoutState(): void {
        this.updateContentLayout();
    }

    private updateContentLayout() {
        if(this.isHidden())
            return;

        console.log("UPDATING LAYOUT STATE - RENDERING");
        console.dir(this);
        console.dir(this.containerState);

        let rect: DOMRect | IRect;
        if(this.containerState === PanelContainerState.Docked) {
            rect = this.domPanelPlaceholder.getBounds();
            console.log("DOCKED");
            console.dir(rect);
        } else if(this.containerState === PanelContainerState.Maximized) {
            rect = this.dockManager.getContainerBoundingRect();
        } else if(this.containerState === PanelContainerState.Floating) {
            rect = this.domDialogFrame.getBoundingClientRect();
            console.log("DIALOG FRAME");
            console.dir(rect);
        }

        this.domContentFrame.applyRect(rect);
    }

    updateContainerState() {
        if(this.dockManager.getActivePanel() === this) {
            this.domFrameHeader.addClass("DockerTS-FrameHeader--Selected");
        } else {
            this.domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }

        this.updateHeaderButtonVisibility();

        if(this.containerState === PanelContainerState.Floating) {
            const zIndex = DOM.from(this.domDialogFrame).getZIndex();
            this.domContentFrame.zIndex(zIndex);
        }
    }

    private updateHeaderButtonVisibility() {
        if(this.containerState === PanelContainerState.Floating) {
            this.showHeaderButton(PANEL_ACTION_EXPAND, this.isCollapsed);
            this.showHeaderButton(PANEL_ACTION_COLLAPSE, ! this.isCollapsed);
            
        } else {
            this.showHeaderButton(PANEL_ACTION_EXPAND, false);
            this.showHeaderButton(PANEL_ACTION_COLLAPSE, false);
        }

    }

    /**
     * Misc Methods
     */


    public setContentElement(content: HTMLElement) {
        this.domContent?.remove();
        this.domContent = content;
        // DOM.from(this.domContent).css("position", "absolute")
        //     .css("left", "0").css("top", "0")
        //     .css("width", "100%").css("height", "100%");
        this.domContentContainer?.appendChild(this.domContent);

        this.contentPanelMouseDown?.unbind();
        this.contentPanelMouseDown = new DOMEvent(content);
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
        }

        this.updateHeaderButtonVisibility();
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
        this.panelPlaceholderRO.unobserve(this.domPanelPlaceholder.get());
        this.panelPlaceholderRO.disconnect();
        this.panelPlaceholderRO = undefined;

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
            if(this.containerState === PanelContainerState.Maximized) {
                this.restorePanel();
            } else {
                this.maximizePanel();
            }
        });
        this.bind(this.domFrameHeader.get(), "contextmenu", this.handleContextMenuClick.bind(this));

        // Create the content container
        this.domContentContainer = DOM.create("div").addClass("DockerTS-ContentContainer")
                .appendTo(this.domContentFrame);
                
        this.bind(this.domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        this.dockManager.getDialogRootElement().appendChild(this.domContentFrame.get());

        this.domPanelPlaceholder = DOM.create("div").attr("tabIndex", "-1").addClass("DockerTS-PanelPlaceholder");
        this.panelPlaceholderRO = new ResizeObserver((entries) => {
            this.updateContentLayout();
        });
        this.panelPlaceholderRO.observe(this.domPanelPlaceholder.get());

        //this.domContentHost = DOM.create("div").addClass("DockerTS-PanelContent").appendTo(this.domPanelPlaceholder);

        //this.domMaximizeRegionHost = DOM.create("div").addClass("DockerTS-MaximizeRegionHost");

        // this.domContentWrapper = DOM.create("div")
        //         .addClass("panel-content-wrapper")
        //         .appendTo(this.domContentHost);

        this.bind(this.domContentFrame.get(), "mousedown", this.handleMouseDownOnPanel.bind(this));

        this.updateTitle();
        this.updateContainerState();

        return this.domPanelPlaceholder.get();
    }
    
    protected onUpdate(element: HTMLElement): void {}

    /**
     * Persistence Management
     */

    static async loadFromState(state: IState, dockManager: DockManager): Promise<PanelContainer> {
        const api = dockManager.gainPanelApiContract(state.panelName);
        const container = new PanelContainer(dockManager, state.panelName, api, state.panelType);
        const contentElement = await api.initialize(new PanelStateAdapter(container), null);
        container.setContentElement(contentElement);
        // TODO: QUERY PANEL TITLE - RESPONSIBILITY OF THE FACTORY METHOD
        container.loadState(state);
        return container;
    }

    saveState(state: IState): void {
        // Save the state of the Panel Container
        state.panelName = this.panelTypeName;
        state.width = this.getWidth();
        state.height = this.getHeight();
        state.canUndock = this.canUndock();
        // MORE COMPLEX BUTTON CONFIGURATION
        // state.hideCloseButton = this.hideCloseButton;
        state.panelType = this.panelType;

        // Save the client state of the panel itself
        const panelClientState = new PanelState();
        this.api.saveState?.(panelClientState);
        state.panelClientState = panelClientState.getState();
    }

    // LOAD PANEL API STATE
    loadState(state: IState) {
        // TODO: QUERIED BY THE LOAD RESIZE IN THE DOCK MANAGER
        const width = state.width;
        const height = state.height;
        // TODO: IF NOT SAVED, FORCE RESIZE SOMEHOW
        this.panelTypeName = state.panelName;
        this.canUndock(state.canUndock);
        // TODO: MORE COMPLEX BUTTON CONFIGURATION
        // this.hideCloseButton = state.hideCloseButton;
        this.panelType = state.panelType;

        const panelClientState = new PanelState(state.panelClientState ?? {});
        this.api.loadState?.(panelClientState);
    }

    /**
     * TODO: WHAT IS THIS GOOD FOR?
     */
    grayOut(show: boolean) {
        // if(show && !this.domGrayingPlaceholder) {
        //     this.domGrayingPlaceholder.remove();
        //     this.domGrayingPlaceholder = undefined;
        //     // if(! this.hideCloseButton) {
        //     //     // TODO: Notify Close Button Visbility Changed
        //     //     // TODO: SHOW CLOSE BUTTON IF ALLOWED - ALL BUTTONS
        //     // }
        // } else if(! show && this.domGrayingPlaceholder) {
        //     // TODO: HIDE CLOSE BUTTON - ALL BUTTONS
        //     this.domGrayingPlaceholder = DOM.create("div").addClass("panel-grayout")
        //         .appendTo(this.domContentWrapper).get();

        //     // TODO: Notify Close Button Visbility Changed
        // }
    }


    /**
     * Dock & Undock Facilities
     */

    canUndock(flag?: boolean): boolean {
        return true;
    }

    performUndockToDialog(event: MouseEvent, dragOffset: IPoint) {
        //this.domContentWrapper.css("display", "block");
        //this.domPanel.css("position", "");
        this.dockManager.requestUndockToDialog(this, event, dragOffset);
    }

    performUndock() {
        this.dockManager.requestUndock(this);
    }

    prepareForDocking() {
        if(this.domDialogFrame) {
            this.panelPlaceholderRO.unobserve(this.domDialogFrame);
        }

        this.dockManager.getDialogRootElement().appendChild(this.domContentFrame.get());
        this.containerState = PanelContainerState.Docked;
        this.updateContainerState();
    }

    prepareForFloating(domDialogFrame: HTMLElement) {
        this.domDialogFrame = domDialogFrame;
        this.panelPlaceholderRO.observe(this.domDialogFrame);

        this.containerState = PanelContainerState.Floating;
        this.updateContainerState();
        this.updateLayoutState();
    }


    /**
     * Closing Facilities
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

    private handleMouseDownOnPanel(event: MouseEvent) {
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

    /**
     * 1) HANDLED BY TABPAGE TO SET ACTIVE ELEMENT
     * 2) HANDLED BY FLOATING DIALOG TO BRING TO FRONT
     */
    private handleMouseFocusEvent(event: MouseEvent) {
        this.triggerEvent("onFocused");
    }
}
