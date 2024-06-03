import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelStateBase } from "./PanelStateBase";


export class MinimizedState extends PanelStateBase {

    private minimizedSlotId = 0;

    public async enterState(initialState: boolean): Promise<void> {
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, false);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, true);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);

        this.minimizedSlotId = this.dockManager.requestMinimizeSlot();
    }

    public async leaveState(): Promise<void> {
        this.dockManager.releaseMinimizeSlot(this.minimizedSlotId);
    }

    public dispose(): void {
        
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("wasHeaderVisible", true);

        const domContentFrame = this.panel.getContentFrameDOM();
        // For animation purposes we need to apply to CSS positioning attributes of the current position
        const currentRect: IRect = domContentFrame.getComputedRect();
        domContentFrame.applyRect(currentRect);
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)
            .removeClass("DockerTS-ContentFrame--Minimized")
            .css("right", "");

        const viewportRect = this.dockManager.getContainerBoundingRect();
        await AnimationHelper.animateMaximize(domContentFrame.get(), {
            x: viewportRect.left, y: viewportRect.top, w: viewportRect.width, h: viewportRect.height
        });
        
        return true;
    }

    async restore(): Promise<boolean> {
        const originalRect: IRect = this.config.get("originalRect");
        const domContentFrame = this.panel.getContentFrameDOM();
        // For animation purposes we need to apply to CSS positioning attributes of the current position
        const currentRect: IRect = domContentFrame.getComputedRect();
        domContentFrame.applyRect(currentRect);
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)
            .removeClass("DockerTS-ContentFrame--Minimized")
            .css("right", "");

        domContentFrame.addClass("DockerTS-ContentFrame--Animating");
        await AnimationHelper.animateRestore(domContentFrame.get(), originalRect);
        domContentFrame.removeClass("DockerTS-ContentFrame--Animating");

        const dialog: Dialog = this.config.get("panelDialog");
        dialog.show();
        // DOM.from(dialog.getDialogFrameDOM()).applyRect(originalRect);
    //        this.panel.getContentFrameDOM().applyRect(originalRect);


        domContentFrame.zIndex("");
        this.panel.setHeaderVisibility(true);

        return true;
    }

    public updateLayoutState(): void {
        super.updateLayoutState();

        const domContentFrame = this.panel.getContentFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const slotPropertyName = this.dockManager.getSlotCSSPropertyName(this.minimizedSlotId);
        domContentFrame.left("").top(``).width("").height(domFrameHeader.getHeight())
            .css("right", `var(${slotPropertyName})`);
    }

    public updatePanelState(): void {
        super.updatePanelState();
    }

    public resize(rect: IRect) {
        
    }
}
