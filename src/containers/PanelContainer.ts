import { DockManager } from "../DockManager";
import { ContainerType, IDockContainer, IPoint, PanelType } from "../common/declarations";
import { IState } from "../common/serialization";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";


/**
 * TODO: API
 */
export class PanelContainer extends Component implements IDockContainer {

    private domPanel: DOM<HTMLElement>;
    private domTitle: DOM<HTMLElement>;
    private domTitleText: DOM<HTMLElement>;
    private domContentHost: DOM<HTMLElement>;

    private domContentWrapper: DOM<HTMLElement>;

    constructor(
        private dockManager: DockManager, 
        private content: HTMLElement,
        private title: string,
        private panelType: PanelType,
        private hideCloseButton: boolean = false
    ) {
        super();
    }

    protected onInitialized(): void {
        DOM.from(this.content).css("position", "absolute")
            .css("left", "0").css("top", "0")
            .css("width", "100%").css("height", "100%");
    }

    protected onDisposed(): void {
        throw new Error("Method not implemented.");
    }

    protected onInitialRender(): HTMLElement {
        const domContentContainer = DOM.create("div").addClass("anel-element-content-container")
                .css("position", "absolute");
        this.bind(domContentContainer.get(), "mousedown", this.handleMouseFocusEvent.bind(this));
        domContentContainer.appendChild(this.content);
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
        // 1) TODO: INVOKE PANEL API TO CREATE A NEW CONTENT ELEMENT
        // 2) RETURN A NEW PANEL CONTAINER WITH NEW CONTENT ELEMENT
        // 3) LOAD STATE FOR THE PANEL CONTENT
        throw 0;
    }

    // TODO: INVOKE SAVE AND LOAD STATE OVER THE PANEL API
    saveState(state: IState): void {
        state.width = this.getWidth();
        state.height = this.getHeight();
        state.canUndock = this.canUndock();
        state.hideCloseButton = this.hideCloseButton;
        state.panelType = this.panelType;
    }

    loadState(state: IState) {
        const width = state.width;
        const height = state.height;
        // TODO: IF NOT SAVED, FORCE RESIZE SOMEHOW
        this.canUndock(state.canUndock);
        this.hideCloseButton = state.hideCloseButton;
        this.panelType = state.panelType;
    }

    grayOut(flag: boolean) {

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

    private setPanelDimensions(width: number, heigth: number) {

    }

    private setDialogPosition(x: number, y: number) {

    }

    setTitle(title: string) {

    }

    setTitleIcon(icon: string) {

    }

    setHasChanges(flag: boolean) {

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