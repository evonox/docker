import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { PanelStateBase } from "./PanelStateBase";


export class MinimizedState extends PanelStateBase {

    public enterState(): void {
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, false);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, true);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);
    }

    public leaveState(): void {
        
    }

    public dispose(): void {
        
    }



    public updateLayoutState(): void {
        const domContentFrame = this.panel.getContentFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        domContentFrame.left("").top(``).width("").height(domFrameHeader.getHeight());
        
    }

    public updatePanelState(): void {
        super.updateLayoutState();
    }
}
