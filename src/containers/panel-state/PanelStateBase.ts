import { IRect, ISize } from "../../common/dimensions";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { RectHelper } from "../../utils/rect-helper";
import { PanelContainer } from "../PanelContainer";
import { IGenericPanelState } from "./IPanelState";
import { SharedStateConfig } from "./SharedStateConfig";
import * as _ from "lodash-es";

/**
 * Class for common logic for all states
 */
export abstract class PanelStateBase implements IGenericPanelState {

    private _lastNotifiedSize: ISize = {w: -1, h: -1};
    private readonly RESIZE_FRAME_RATE = 60;

    constructor(
        protected dockManager: DockManager, 
        protected panel: PanelContainer,
        protected config: SharedStateConfig
    ) {
        // We reduce the invocation of the resize notifications to maximum 60 FPS now
        this.invokeClientResizeEvent = _.throttle(this.invokeClientResizeEvent.bind(this), 
            1000 / this.RESIZE_FRAME_RATE, {leading: true, trailing: true});
    }

    enterState(): void {}
    leaveState(): void {}
    dispose(): void {}

    // Transition State methods - by default return "false" - means that given transition is not allowed
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

    protected notifySizeChanged() {
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

    // If panel is active / focused - toggle the visual style of the frame header
    updatePanelState(): void {
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        if(this.dockManager.getActivePanel() === this.panel) {
            domFrameHeader.addClass("DockerTS-FrameHeader--Selected");
        } else {
            domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }
    }

    updateLayoutState(): void {}

    public abstract resize(rect: IRect): void;
}
