import { DockManager } from "../DockManager";
import { PanelContainerAdapter } from "../api/PanelContainerAdapter";
import { PanelState } from "../api/PanelState";
import { ContainerType, IDockContainer, IPoint, ISize, PanelType } from "../common/declarations";
import { IPanelAPI } from "../common/panel-api";
import { IState } from "../common/serialization";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";


/**
 * TODO: INTRODUCE BUTTON BAR FOR CUSTOM BUTTONS BASED BY THE ORDER - A SPECIAL DOM ELEMENT
 * 1. ICON BUTTON ELEMENT - ACTION
 * 2. CONTEXT MENU - ACTION, ON QUERY API METHOD, CREATES MENUS AND SEPARATORS
 * 2.A. PERFORMS LAYOUTING USING OPEN TOOLKIT POSITIONING HELPER - COPY IT FROM OPEN TOOLKIT
 * 3. MENU ITEM - TOOLKIT BUTTON
 * 4. MENU SEPARATOR
 * 5. CREATE A WRAPPER FOR PANEL API ADAPTER TO PASS IT TO THE FACTORY METHOD
 * 
 */
export class PanelContainer extends Component implements IDockContainer {

    private domPanel: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;
    private domTitleText: DOM<HTMLElement>;
    private domContentHost: DOM<HTMLElement>;

    private domContentWrapper: DOM<HTMLElement>;
    private domContent: HTMLElement;

    private domContentContainer: DOM<HTMLElement>;
    private domGrayingPlaceholder: HTMLElement;

    private _hasChanges: boolean = false;

    constructor(
        private dockManager: DockManager, 
        private panelName: string,
        private api: IPanelAPI,
        private title: string,
        private panelType: PanelType,
        private hideCloseButton: boolean = false
    ) {
        super();
    }
    getMinimumChildNodeCount(): number {
        throw new Error("Method not implemented.");
    }
    setActiveChild(container: IDockContainer): void {
        throw new Error("Method not implemented.");
    }

    public setContent(content: HTMLElement) {
        this.domContent = content;
        DOM.from(this.domContent).css("position", "absolute")
            .css("left", "0").css("top", "0")
            .css("width", "100%").css("height", "100%");
        this.domContentContainer.appendChild(this.domContent);
    }

    public getHeaderElement(): HTMLElement {
        return this.domTitle.get();
    }

    protected onInitialized(): void {}

    protected onDisposed(): void {
        throw new Error("Method not implemented.");
    }

    protected onInitialRender(): HTMLElement {
        const domContentContainer = DOM.create("div").addClass("anel-element-content-container")
                .css("position", "absolute");
        this.bind(domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        this.dockManager.getDialogRootElement().appendChild(domContentContainer.get());

        this.domPanel = DOM.create("div").attr("tabIndex", "0").addClass("panel-base");
        this.domTitle = DOM.create("div").addClasses(["panel-titlebar", "disable-selection"]);
        this.domTitleText = DOM.create("div").addClass("panel-titlebar-text");
        this.domContentHost = DOM.create("div").addClass("panel-content").appendTo(this.domPanel);

        this.domContentWrapper = DOM.create("div")
                .addClass("panel-content-wrapper")
                .appendTo(this.domContentHost);

        // TODO: UPDATE PANEL DIMENSIONS

        // TODO: CLOSE BUTTON????
        // TODO: ATTACH OR DETACH CLOSE BUTTON BASED ON THE FLAG
        // TODO: FUTURE THERE WILL BE MORE BUTTONS - EXTRACT A BUTTON COMPONENT
        // TODO: CREATE ATTACH / DETACH BUTTON AND CLOSE BUTTON

        this.bind(this.domPanel.get(), "mousedown", this.handleMouseDownOnPanel.bind(this));
        return this.domPanel.get();
    }
    
    protected onUpdate(element: HTMLElement): void {
        throw new Error("Method not implemented.");
    }

    static async loadFromState(state: IState, dockManager: DockManager): Promise<PanelContainer> {
        const api = dockManager.queryPanelAPI(state.panelName);
        const container = new PanelContainer(dockManager, state.panelName, api, "", state.panelType, state.hideCloseButton);
        const contentElement = await api.initialize(new PanelContainerAdapter(container), null);
        container.setContent(contentElement);
        // TODO: QUERY PANEL TITLE - RESPONSIBILITY OF THE FACTORY METHOD
        container.loadState(state);
        return container;
    }

    getDockManager(): DockManager {
        return this.dockManager;
    }

    saveState(state: IState): void {
        // Save the state of the Panel Container
        state.panelName = this.panelName;
        state.width = this.getWidth();
        state.height = this.getHeight();
        state.canUndock = this.canUndock();
        state.hideCloseButton = this.hideCloseButton;
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
        this.panelName = state.panelName;
        this.canUndock(state.canUndock);
        this.hideCloseButton = state.hideCloseButton;
        this.panelType = state.panelType;

        const panelClientState = new PanelState(state.panelClientState ?? {});
        this.api.loadState?.(panelClientState);
    }

    grayOut(show: boolean) {
        if(show && !this.domGrayingPlaceholder) {
            this.domGrayingPlaceholder.remove();
            this.domGrayingPlaceholder = undefined;
            if(! this.hideCloseButton) {
                // TODO: Notify Close Button Visbility Changed
                // TODO: SHOW CLOSE BUTTON IF ALLOWED - ALL BUTTONS
            }
        } else if(! show && this.domGrayingPlaceholder) {
            // TODO: HIDE CLOSE BUTTON - ALL BUTTONS
            this.domGrayingPlaceholder = DOM.create("div").addClass("panel-grayout")
                .appendTo(this.domContentWrapper).get();

            // TODO: Notify Close Button Visbility Changed
        }
    }

    setCloseButtonVisibility(flag: boolean) {

    }

    // TODO: ON DISPOSE
    destroy() {

    }

    performUndockToDialog(event: MouseEvent, dragOffset: IPoint) {

    }

    performUndock() {

    }

    prepareForDocking() {

    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        throw new Error("Method not implemented.");
    }

    resize(width: number, height: number): void {
        throw new Error("Method not implemented.");
    }

    saveLastDialogSize(size: ISize) {
        
    }

    private setPanelDimensions(width: number, heigth: number) {

    }

    setDialogPosition(x: number, y: number) {

    }

    setTitle(title: string) {
        this.title = title;
        // TODO: UPDATE TITLE
        // TODO: NOTIFY ABOUT TITLE CHANGED
    }

    setTitleIcon(icon: string) {
        // TODO: UPDATE TITLE
        // TODO: NOTIFY ABOUT TITLE CHANGED
    }

    setHasChanges(flag: boolean) {
        this._hasChanges = flag;
        // TODO: UPDATE TITLE
        // TODO: NOTIFY ABOUT TITLE CHANGED
    }

    async close() {

    }

    private async closeInternal(runCallback: boolean) {

    }



    private updateTitle() {

    }

    // TODO: SEND BETTER USING EVENT
    getRawTitle(): string {
        throw 0;
    }
    

    // TODO: WHAT IS THIS GOOD FOR??
    private panelDocked() {

    }

    // TODO: WIDTH AND HEIGHT SETTINGS

    private performClose() {


    }




    ///////////////////////////////////////////

    canUndock(flag?: boolean): boolean {
        throw 0;
    }
    
    hasChanges(): boolean {
        throw new Error("Method not implemented.");
    }
    setVisible(visible: boolean): void {
        throw new Error("Method not implemented.");
    }
    getMinWidth(): number {
        throw new Error("Method not implemented.");
    }
    getMinHeight(): number {
        throw new Error("Method not implemented.");
    }
    getWidth(): number {
        throw new Error("Method not implemented.");
    }
    getHeight(): number {
        throw new Error("Method not implemented.");
    }

    getContainerType(): ContainerType {
        throw 0;
    }

    getPosition(): IPoint {
        throw 0;
    }

    isHidden(): boolean {
        throw 0;
    }



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