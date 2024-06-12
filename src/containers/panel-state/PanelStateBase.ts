import { IRect, ISize } from "../../common/dimensions";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE, PANEL_ACTION_SHOW_POPUP, PANEL_ACTION_TOGGLE_PIN } from "../../core/panel-default-buttons";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { EventHelper } from "../../utils/event-helper";
import { RectHelper } from "../../utils/rect-helper";
import { IResizeObservedElement, ResizeObserverHelper } from "../../utils/resize-observer-helper";
import { PanelContainer } from "../PanelContainer";
import { IGenericPanelState } from "./IPanelState";
import { SharedStateConfig } from "./SharedStateConfig";

export interface IHeaderButtonConfiguration {
    expand: boolean;
    collapse: boolean;
    maximize: boolean;
    minimize: boolean;
    restore: boolean;
    popup: boolean;
    pin: boolean;
}

/**
 * Class for common logic for all states
 */
export abstract class PanelStateBase implements IGenericPanelState {

    private _lastNotifiedSize: ISize = {w: -1, h: -1};
    private readonly RESIZE_FRAME_RATE = 60;

    private observedElements: IResizeObservedElement[] = [];

    constructor(
        protected dockManager: DockManager, 
        protected panel: PanelContainer,
        protected config: SharedStateConfig
    ) {
        // We reduce the invocation of the resize notifications to maximum 60 FPS now
        this.invokeClientResizeEvent = EventHelper.throttle(this.invokeClientResizeEvent.bind(this), 
            1000 / this.RESIZE_FRAME_RATE, {leading: true, trailing: true});
    }

    async enterState(initialState: boolean): Promise<void> {}

    async leaveState(): Promise<void> {
        this.disposeResizeObserver();
    }

    dispose(): void {
        this.disposeResizeObserver();
    }

    private disposeResizeObserver() {
        this.observedElements.forEach(element => element.unobserve());
        this.observedElements = [];
    }

    // Transition State methods - by default returning "false" - means that given transition is not allowed
    async dockPanel(): Promise<boolean> {
        return false;
    }

    async floatPanel(dialog: Dialog): Promise<boolean> {
        return false;
    }

    async minimize(): Promise<boolean> {
        return false;
    }

    async maximize(): Promise<boolean> {
        return false;
    }

    async restore(): Promise<boolean> {
        return false;
    }

    async collapse(): Promise<boolean> {
        return false;
    }

    async expand(): Promise<boolean> {
        return false;
    }

    async showPopup(): Promise<boolean> {
        return false;
    }

    async hidePopup(): Promise<boolean> {
        return false;
    }

    async pinPanel(): Promise<boolean> {
        return false;
    }

    async unpinPanel(): Promise<boolean> {
        return false;
    }

    protected observeElement(element: HTMLElement, handler: () =>  void) {
        const api = ResizeObserverHelper.observeElement(element, handler);
        this.observedElements.push(api);
    }

    protected configureButtons(config: IHeaderButtonConfiguration): void {
        this.toggleButtonVisibility(PANEL_ACTION_MINIMIZE, config.minimize);
        this.toggleButtonVisibility(PANEL_ACTION_MAXIMIZE, config.maximize);
        this.toggleButtonVisibility(PANEL_ACTION_RESTORE, config.restore);
        this.toggleButtonVisibility(PANEL_ACTION_EXPAND, config.expand);
        this.toggleButtonVisibility(PANEL_ACTION_COLLAPSE, config.collapse);
        this.toggleButtonVisibility(PANEL_ACTION_SHOW_POPUP, config.popup);
        this.toggleButtonVisibility(PANEL_ACTION_TOGGLE_PIN, config.pin);
    }

    private toggleButtonVisibility(actionName: string, flag: boolean) {
        this.panel.setActionAllowedByState(actionName, flag);
        const finalFlag = this.panel.isActionAllowed(actionName);
        this.panel.showHeaderButton(actionName, finalFlag);
    }

    updateState(): void {
        this.notifyIfSizeChanged();
        this.updateFrameHeaderSelectionState();
    }

    protected notifyIfSizeChanged() {
        let rect = this.panel.getContentHostDOM().getBoundsRect();
        // We round down to whole pixels to prevent vain resize notifications
        rect = RectHelper.floor(rect); 
        if(this.hasSizeChanged(rect)) {
            this._lastNotifiedSize = {w: rect.w, h: rect.h};
            // Invoke the throttled method for resizing
            this.invokeClientResizeEvent(rect);
        }
    }

    private invokeClientResizeEvent(rect: IRect) {
        this.panel.getAPI().onResize?.(rect.w, rect.h);
    }

    private hasSizeChanged(rect: IRect) {
        return this._lastNotifiedSize.w !== rect.w || this._lastNotifiedSize.h !== rect.h;
    }

    private updateFrameHeaderSelectionState() {
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        if(this.dockManager.getActivePanel() === this.panel) {
            domFrameHeader.addClass("DockerTS-FrameHeader--Selected");
        } else {
            domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }
    }
}
