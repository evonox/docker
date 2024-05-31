import { ISize } from "../../common/dimensions";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { PanelContainer } from "../PanelContainer";
import { IGenericPanelState } from "./IPanelState";
import { SharedStateConfig } from "./SharedStateConfig";

/**
 * Class for common logic for all states
 */
export abstract class PanelStateBase implements IGenericPanelState {

    private _lastSize: ISize = {w: -1, h: -1};

    constructor(
        protected dockManager: DockManager, 
        protected panel: PanelContainer,
        protected config: SharedStateConfig
    ) {}

    enterState(): void {}
    leaveState(): void {}
    dispose(): void {}

    // Transition State methods - by default return "false" - means that transition not allowed
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
        console.log("NOTIFY SIZE CHANGED");
        const { w, h} = this.panel.getContentContainerDOM().getBoundsRect();
        if(this._lastSize.w !== w || this._lastSize.h !== h) {
            this._lastSize = {w: w, h: h};
            this.panel.getAPI().onResize?.(w, h);
        }
    }


    // Misc update state methods
    updatePanelState(): void {
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        if(this.dockManager.getActivePanel() === this.panel) {
            domFrameHeader.addClass("DockerTS-FrameHeader--Selected");
        } else {
            domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }
    }

    updateLayoutState(): void {
        this.notifySizeChanged();
    }
}
