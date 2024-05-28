import { PanelContainerState } from "../../common/enumerations";
import { Dialog } from "../../floating/Dialog";
import { PanelStateBase } from "./PanelStateBase";


export class MaximizedState extends PanelStateBase {

    public enterState(): void {}

    public leaveState(): void {
        
    }

    public dispose(): void {
        
    }

    async restore(): Promise<boolean> {
        const previousState = this.config.get("restoreState", PanelContainerState.Docked);
        const wasHeaderVisible = this.config.get("wasHeaderVisible", true);

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex("");
        this.panel.setHeaderVisibility(wasHeaderVisible);

        return true;
    }

    public updateLayoutState(): void {
        const rect = this.dockManager.getContainerBoundingRect();
        this.panel.getContentFrameDOM().applyRect(rect);
    }

    public updatePanelState(): void {
        super.updateLayoutState();
        
    }
}
