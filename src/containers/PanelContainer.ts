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


export class PanelContainer extends Component implements IDockContainer {

    // DOM State Variables
    private domPanel: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;
    private domTitleText: DOM<HTMLElement>;
    private domContentHost: DOM<HTMLElement>;

    private domContentWrapper: DOM<HTMLElement>;
    private domContent: HTMLElement;

    private domContentContainer: DOM<HTMLElement>;
    private domGrayingPlaceholder: HTMLElement;

    // Icon & Title State
    private _iconHtml: string = "";
    private _title: string = "";
    private _hasChanges: boolean = false;

    // Dimensions & Resizing State
    private _lastDialogSize: ISize;

    constructor(
        private dockManager: DockManager, 
        private panelTypeName: string,
        private api: IPanelAPI,
        private panelType: PanelType
    ) {
        super();
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
        this.triggerEvent("onTitleChanged");
    }

    /**
     * Misc Query and Helper Methods
     */

    canUndock(flag?: boolean): boolean {
        return true;
    }
    
    setVisible(visible: boolean): void {
        throw new Error("Method not implemented.");
    }

    getContainerType(): ContainerType {
        return ContainerType.Panel;
    }


    isHidden(): boolean {
        return false;
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        throw new Error("Method not implemented.");
    }
    getMinimumChildNodeCount(): number {
        throw new Error("Method not implemented.");
    }
    setActiveChild(container: IDockContainer): void {
        throw new Error("Method not implemented.");        
    }

    activatePanel() {

    }

    getDockManager(): DockManager {
        return this.dockManager;
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
        this.domTitle.width(width); // Note: Add Place for Buttons, or layout by CSS
        this.domContentHost.width(width);
        this.domContentContainer.width(width);

        const titleBarHeight = this.domTitle.getHeight();
        const contentHeight = height - titleBarHeight;
        this.domContentHost.height(contentHeight);
        this.domContentContainer.height(contentHeight);
        this.domPanel.height(height);

        // TODO: WHAT IS domElementContentWrapper
    }

    // PanelContainer is leaf node => no layouting logic
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {}

    /**
     * Misc Methods
     */


    public setContentElement(content: HTMLElement) {
        this.domContent = content;
        DOM.from(this.domContent).css("position", "absolute")
            .css("left", "0").css("top", "0")
            .css("width", "100%").css("height", "100%");
        this.domContentContainer?.appendChild(this.domContent);
    }

    public getHeaderElement(): HTMLElement {
        return this.domTitle.get();
    }

    /**
     *  Header Button Management
     */

    addHeaderButton(button: IHeaderButton): void {}
    removeHeaderButton(actionName: string): void {}
    showHeaderButton(actionName: string, flag: boolean): void {}

    /**
     * Framework Component Callbacks
     */

    protected onInitialized(): void {}

    protected onDisposed(): void {
        throw new Error("Method not implemented.");
    }

    protected onInitialRender(): HTMLElement {
        this.domContentContainer = DOM.create("div").addClass("anel-element-content-container")
                .css("position", "absolute");
        this.bind(this.domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        this.dockManager.getDialogRootElement().appendChild(this.domContentContainer.get());

        this.domPanel = DOM.create("div").attr("tabIndex", "0").addClass("panel-base");
        this.domTitle = DOM.create("div").addClasses(["panel-titlebar", "disable-selection"]);
        this.domTitleText = DOM.create("div").addClass("panel-titlebar-text");
        this.domContentHost = DOM.create("div").addClass("panel-content").appendTo(this.domPanel);

        this.domContentWrapper = DOM.create("div")
                .addClass("panel-content-wrapper")
                .appendTo(this.domContentHost);
        if(this.domContent) {
            this.domContentContainer.appendChild(this.domContent);
        }

        // TODO: UPDATE PANEL DIMENSIONS

        // TODO: CLOSE BUTTON????
        // TODO: ATTACH OR DETACH CLOSE BUTTON BASED ON THE FLAG
        // TODO: FUTURE THERE WILL BE MORE BUTTONS - EXTRACT A BUTTON COMPONENT
        // TODO: CREATE ATTACH / DETACH BUTTON AND CLOSE BUTTON

        this.bind(this.domPanel.get(), "mousedown", this.handleMouseDownOnPanel.bind(this));
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

    performUndockToDialog(event: MouseEvent, dragOffset: IPoint) {

    }

    performUndock() {

    }

    prepareForDocking() {

    }

    /**
     * Closing Facilities
     */

    async close() {

    }

    private async closeInternal(runCallback: boolean) {

    }
    
    private performClose() {


    }

    // TODO: ON DISPOSE
    destroy() {

    }

    /**
     * Event Handlers
     */

    private handleMouseDownOnPanel(event: MouseEvent) {
    }

    /**
     * 1) HANDLED BY TABPAGE TO SET ACTIVE ELEMENT
     * 2) HANDLED BY FLOATING DIALOG TO BRING TO FRONT
     */
    private handleMouseFocusEvent(event: MouseEvent) {
        this.triggerEvent("onFocused");
    }
}
