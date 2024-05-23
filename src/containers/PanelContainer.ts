import { DockManager } from "../facade/DockManager";
import { PanelStateAdapter } from "../api/PanelStateAdapter";
import { PanelState } from "../api/PanelState";
import { IDockContainer } from "../common/declarations";
import { IContextMenuAPI, IHeaderButton, IPanelAPI } from "../common/panel-api";
import { IState } from "../common/serialization";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { ContainerType, PanelType } from "../common/enumerations";
import { IPoint, ISize } from "../common/dimensions";
import { PanelButtonBar } from "../core/PanelButtonBar";

import "./PanelContainer.css";
import { DOMEvent } from "../framework/dom-events";

export class PanelContainer extends Component implements IDockContainer {

    // DOM State Variables
    private domPanel: DOM<HTMLElement>;
    private domPanelHeader: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;
    private domTitleText: DOM<HTMLElement>;
    private domContentHost: DOM<HTMLElement>;

    private domContentWrapper: DOM<HTMLElement>;
    private domContent: HTMLElement;

    private domContentContainer: DOM<HTMLElement>;
    private domGrayingPlaceholder: HTMLElement;

    private buttonBar: PanelButtonBar;

    // Icon & Title State
    private _iconHtml: string = "";
    private _title: string = "";
    private _hasChanges: boolean = false;

    // Dimensions & Resizing State
    private _lastDialogSize: ISize;

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
        this.domTitleText.text(this._title).appendTo(this.domTitle);
        this.domTitle.toggleClass("has-changes", this._hasChanges);

        this.triggerEvent("onTitleChanged", this.getTitleHtml());
    }

    /**
     * Misc Query and Helper Methods
     */

    getDockManager(): DockManager {
        return this.dockManager;
    }
    
    isHidden(): boolean {
        return ! this._isVisible;
    }

    setVisible(visible: boolean): void {
        this._isVisible = visible;
        this.domPanel.css("display", visible ? "block" : "none");
        this.domContentContainer.css("display", visible ? "block" : "none");
    }

    setHeaderVisibility(visible: boolean): void {
        this.domPanelHeader.css("display", visible ? "flex" : "none");
    }


    getContainerType(): ContainerType {
        return ContainerType.Panel;
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        return this.api.onQueryContextMenu?.(config);
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
        const bounds = this.domPanel.getBounds();
        return {x: bounds.left, y: bounds.y};
    }

    getWidth(): number {
        const bounds = this.domPanel.getBounds();
        return bounds.width;
    }

    getHeight(): number {
        const bounds = this.domPanel.getBounds();
        return bounds.height;
    }

    getMinWidth(): number {
        return this.api.getMinWidth?.() ?? this.dockManager.config.defaultMinWidth;
    }

    getMinHeight(): number {
        return this.api.getMinHeight?.() ?? this.dockManager.config.defaultMinHeight;
    }

    setDialogPosition(x: number, y: number) {
        this.domPanel.left(x).top(y);
    }

    setPanelDimensions(width: number, heigth: number) {
        this.domPanel.width(width).height(heigth);
    }

    getLastDialogSize(): ISize {
        return {...this._lastDialogSize};
    }

    saveLastDialogSize(size: ISize) {
        this._lastDialogSize = {...size};
    }

    /**
     * RECALCULATE SIZE OF INTERNALS - NOTIFY ON RESIZE THE PANEL
     * REMOVE JS DIMENSION CALCULATION AS MUCH AS POSSIBLE
     */
    resize(width: number, height: number): void {

        // TODO: COULD BE LAYOUT BY CSS GRID / FLEX???
        this.domPanel.width(width);
        this.domPanelHeader.width(width); // Note: Add Place for Buttons, or layout by CSS
        this.domContentHost.width(width);
        this.domContentContainer.width(width);

        const titleBarHeight = this.domTitle.getHeight();
        const contentHeight = height - titleBarHeight;
        this.domContentHost.height(contentHeight);
        this.domContentContainer.height(contentHeight);
        this.domContentWrapper.height(contentHeight);
        this.domPanel.height(height);

        const boundsDockingContainer = this.dockManager.getContainerBoundingRect();
        const boundsContentWrapper = this.domContentWrapper.getBounds();
        this.domContentContainer.left(boundsContentWrapper.left - boundsDockingContainer.left)
            .top(boundsContentWrapper.top - boundsDockingContainer.top)
            .width(boundsContentWrapper.width).height(boundsContentWrapper.height);
    }

    // PanelContainer is leaf node => no layouting logic
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {}

    updateContainerState() {
        if(this.dockManager.getActivePanel() === this) {
            this.domPanelHeader.addClass("DockerTS-PanelHeader--Selected");
        } else {
            this.domPanelHeader.removeClass("DockerTS-PanelHeader--Selected");
        }
    }

    /**
     * Misc Methods
     */


    public setContentElement(content: HTMLElement) {
        this.domContent = content;
        DOM.from(this.domContent).css("position", "absolute")
            .css("left", "0").css("top", "0")
            .css("width", "100%").css("height", "100%");
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

    /**
     * Framework Component Callbacks
     */

    protected onInitialized(): void {
        this._iconHtml = "";
        this._hasChanges = false;
        this._title = this.dockManager.config.defaultPanelLabel;
    }

    protected onDisposed(): void {
        this.buttonBar.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domContentContainer = DOM.create("div").addClass("anel-element-content-container")
                .css("position", "absolute");
        this.bind(this.domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        this.dockManager.getDialogRootElement().appendChild(this.domContentContainer.get());

        this.domPanel = DOM.create("div").attr("tabIndex", "0").addClass("DockerTS-Panel");
        this.domPanelHeader = DOM.create("div").addClass("DockerTS-PanelHeader").css("display", "none").appendTo(this.domPanel);
        this.domTitle = DOM.create("div").addClasses(["DockerTS-HeaderTitleBar"]);
        this.domTitleText = DOM.create("div");
        this.domContentHost = DOM.create("div").addClass("DockerTS-PanelContent").appendTo(this.domPanel);

        this.domContentWrapper = DOM.create("div")
                .addClass("panel-content-wrapper")
                .appendTo(this.domContentHost);

        this.buttonBar = new PanelButtonBar();
        this.domPanelHeader.appendChild(this.domTitle);
        this.domPanelHeader.appendChild(this.buttonBar.getDOM());

        this.bind(this.domPanel.get(), "mousedown", this.handleMouseDownOnPanel.bind(this));

        this.updateTitle();

        return this.domPanel.get();
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
        if(show && !this.domGrayingPlaceholder) {
            this.domGrayingPlaceholder.remove();
            this.domGrayingPlaceholder = undefined;
            // if(! this.hideCloseButton) {
            //     // TODO: Notify Close Button Visbility Changed
            //     // TODO: SHOW CLOSE BUTTON IF ALLOWED - ALL BUTTONS
            // }
        } else if(! show && this.domGrayingPlaceholder) {
            // TODO: HIDE CLOSE BUTTON - ALL BUTTONS
            this.domGrayingPlaceholder = DOM.create("div").addClass("panel-grayout")
                .appendTo(this.domContentWrapper).get();

            // TODO: Notify Close Button Visbility Changed
        }
    }


    /**
     * Dock & Undock Facilities
     */

    canUndock(flag?: boolean): boolean {
        return true;
    }

    performUndockToDialog(event: MouseEvent, dragOffset: IPoint) {
        this.domContentWrapper.css("display", "block");
        this.domPanel.css("position", "");
        this.dockManager.requestUndockToDialog(this, event, dragOffset);
    }

    performUndock() {
        this.dockManager.requestUndock(this);
    }

    prepareForDocking() {
        this.dockManager.getDialogRootElement().appendChild(this.domContentContainer.get());
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
    
    private performClose() {
        this.domContentWrapper.css("display", "block");
        this.domContentContainer.css("display", "none");
        this.domPanel.css("position", "");
        this.dockManager.requestClose(this);
    }

    destroy() {
        this.dispose();
    }

    /**
     * Event Handlers
     */

    private handleMouseDownOnPanel(event: MouseEvent) {
        console.dir("PANEL ACTIVATED");
        this.activatePanel();
    }

    /**
     * 1) HANDLED BY TABPAGE TO SET ACTIVE ELEMENT
     * 2) HANDLED BY FLOATING DIALOG TO BRING TO FRONT
     */
    private handleMouseFocusEvent(event: MouseEvent) {
        this.triggerEvent("onFocused");
    }
}
