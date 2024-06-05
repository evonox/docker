import { IRect, ISize } from "../../common/dimensions";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE, PANEL_ACTION_SHOW_POPUP } from "../../core/panel-default-buttons";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { RectHelper } from "../../utils/rect-helper";
import { PanelContainer } from "../PanelContainer";
import { IGenericPanelState } from "./IPanelState";
import { SharedStateConfig } from "./SharedStateConfig";
import * as _ from "lodash-es";

export interface IHeaderButtonConfiguration {
    expand: boolean;
    collapse: boolean;
    maximize: boolean;
    minimize: boolean;
    restore: boolean;
    popup: boolean;
}

/**
 * Class for common logic for all states
 */
export abstract class PanelStateBase implements IGenericPanelState {

    private _lastNotifiedSize: ISize = {w: -1, h: -1};
    private readonly RESIZE_FRAME_RATE = 60;

    private resizeObserver: ResizeObserver;
    private elementObservers: Map<Element, Function> = new Map<Element, Function>();

    constructor(
        protected dockManager: DockManager, 
        protected panel: PanelContainer,
        protected config: SharedStateConfig
    ) {
        // We reduce the invocation of the resize notifications to maximum 60 FPS now
        this.invokeClientResizeEvent = _.throttle(this.invokeClientResizeEvent.bind(this), 
            1000 / this.RESIZE_FRAME_RATE, {leading: true, trailing: true});
    }

    async enterState(initialState: boolean): Promise<void> {
        this.resizeObserver = new ResizeObserver((entries) => {
            for(const entry of entries) {
                if(this.elementObservers.has(entry.target)) {
                    const handler = this.elementObservers.get(entry.target);
                    handler();
                }
            }
        });
    }

    async leaveState(): Promise<void> {
        this.disposeResizeObserver();
    }

    dispose(): void {
        this.disposeResizeObserver();
    }

    private disposeResizeObserver() {
        if(this.resizeObserver !== undefined) {
            for(const element of this.elementObservers.keys()) {
                this.unobserveElement(element as HTMLElement);
            }
            this.resizeObserver.disconnect();
            this.resizeObserver = undefined;
        }
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

    protected observeElement(element: HTMLElement, handler: Function) {
        this.elementObservers.set(element, handler);
        // Prevent recursive callbacks when the content overflows
        DOM.from(element).css("overflow", "hidden");
        this.resizeObserver.observe(element);
    }

    protected unobserveElement(element: HTMLElement) {
        DOM.from(element).css("overflow", "");
        this.resizeObserver.unobserve(element);
        this.elementObservers.delete(element);
    }

    protected configureButtons(config: IHeaderButtonConfiguration): void {
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, config.minimize);
        this.panel.showHeaderButton(PANEL_ACTION_MAXIMIZE, config.maximize);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, config.restore);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, config.expand);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, config.collapse);
        this.panel.showHeaderButton(PANEL_ACTION_SHOW_POPUP, config.popup);
    }

    updateState(): void {
        this.notifyIfSizeChanged();
        this.updateFrameHeaderSelectionState();
    }

    protected notifyIfSizeChanged() {
        let rect = this.panel.getContentContainerDOM().getBoundsRect();
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
