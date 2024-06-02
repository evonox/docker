import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelStateBase } from "./PanelStateBase";


export class MaximizedState extends PanelStateBase {

    private panelPlaceholderRO: ResizeObserver = undefined;

    public enterState(): void {
        const restoreState = this.config.get("restoreState");
        // Note: Minimization not supported when we come from the Docked State
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, restoreState === PanelContainerState.Floating);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, true);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);

        const containerRect = this.dockManager.getContainerBoundingRect();
        this.panel.getContentFrameDOM().applyRect(containerRect);

        this.updateLayoutState();
    }

    public leaveState(): void {
        this.stopSizeObservation();
    }

    public dispose(): void {
        this.stopSizeObservation();
    }

    async minimize(): Promise<boolean> {
        const domContentFrame = this.panel.getContentFrameDOM();
        const minimizedFreeSlot = this.dockManager.getNextFreeMinimizedSlotRect();
        await AnimationHelper.animateMinimize(domContentFrame.get(), minimizedFreeSlot);
        domContentFrame.addClass("DockerTS-ContentFrame--Minimized");
        return true;        
    }

    async restore(): Promise<boolean> {
        const previousState = this.config.get("restoreState", PanelContainerState.Docked);
        const wasHeaderVisible = this.config.get("wasHeaderVisible", true);
        let originalRect: IRect = this.config.get("originalRect");
        if(previousState === PanelContainerState.Docked) {
            originalRect = this.panel.getPlaceholderDOM().getBoundsRect();
        }

        const domContentFrame = this.panel.getContentFrameDOM();

        this.startSizeObservation();

        if(previousState === PanelContainerState.Docked && wasHeaderVisible === false) {
            const domHeader = this.panel.getFrameHeaderDOM();
            await AnimationHelper.animateRestoreNoHeader(domContentFrame.get(), domHeader.get(), originalRect);;
            domHeader.height("");
        } else {
            await AnimationHelper.animateRestore(domContentFrame.get(), originalRect);

            if(previousState === PanelContainerState.Floating) {
                const dialog: Dialog = this.config.get("panelDialog");
                DOM.from(dialog.getDialogFrameDOM()).applyRect(originalRect);
                dialog.show();      
            }
        }

        this.stopSizeObservation();

        domContentFrame.zIndex("");
        this.panel.updateLayoutState();
        this.panel.setHeaderVisibility(wasHeaderVisible);
        domContentFrame.applyRect(originalRect);

        return true;
    }

    public updateLayoutState(): void {
    }

    public updatePanelState(): void {
        super.updatePanelState();
        
    }

    public resize(rect: IRect) {
        if(this.panelPlaceholderRO !== undefined)
            return;
        const containerRect = this.dockManager.getContainerBoundingRect();
        this.panel.getContentFrameDOM().applyRect(containerRect);       
    }

    private startSizeObservation() {
        this.panelPlaceholderRO = new ResizeObserver((entries) => {
            this.panel.invalidate();
        });

        const domContainerFrame = this.panel.getContentFrameDOM().get();
        this.panelPlaceholderRO.observe(domContainerFrame, {box: "border-box"});       
    }

    private stopSizeObservation() {
        if(this.panelPlaceholderRO !== undefined) {
            const domContainerFrame = this.panel.getContentFrameDOM().get();
            this.panelPlaceholderRO.unobserve(domContainerFrame);       
            this.panelPlaceholderRO.disconnect();
            this.panelPlaceholderRO = undefined;   
        }
    }
}
