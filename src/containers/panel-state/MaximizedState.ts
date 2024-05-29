import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelStateBase } from "./PanelStateBase";


export class MaximizedState extends PanelStateBase {

    public enterState(): void {
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, true);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, true);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);
    }

    public leaveState(): void {
        
    }

    public dispose(): void {
        
    }

    async restore(): Promise<boolean> {
        const previousState = this.config.get("restoreState", PanelContainerState.Docked);
        const wasHeaderVisible = this.config.get("wasHeaderVisible", true);
        const originalRect = this.config.get("originalRect");
        console.dir(originalRect);

        const domContentFrame = this.panel.getContentFrameDOM();

        if(previousState === PanelContainerState.Docked && wasHeaderVisible === false) {
            const domHeader = this.panel.getFrameHeaderDOM();
            await AnimationHelper.animateRestoreNoHeader(domContentFrame.get(), domHeader.get(), originalRect);;
            domHeader.height("");
        } else {
            await AnimationHelper.animateRestore(domContentFrame.get(), originalRect);
        }

        domContentFrame.zIndex("");
        this.panel.setHeaderVisibility(wasHeaderVisible);

        return true;
    }

    public updateLayoutState(): void {
        const rect = this.dockManager.getContainerBoundingRect();
        this.panel.getContentFrameDOM().applyRect(rect);
    }

    public updatePanelState(): void {
        super.updatePanelState();
        
    }
}
