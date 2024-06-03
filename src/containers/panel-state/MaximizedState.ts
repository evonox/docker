import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { DOMUpdateInitiator } from "../../utils/DOMUpdateInitiator";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelStateBase } from "./PanelStateBase";


export class MaximizedState extends PanelStateBase {

    private panelPlaceholderRO: ResizeObserver = undefined;

    public async enterState(initialState: boolean): Promise<void> {
        // Note: Minimization not supported when we come from the Docked State
        const restoreState = this.config.get("restoreState");
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, restoreState === PanelContainerState.Floating);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, true);
        this.panel.showHeaderButton(PANEL_ACTION_MAXIMIZE, false);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);

        // Move the maximized panel to the TOP of viewport
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel);
        this.panel.updateLayoutState(); // To update nested panels of TabbedPanelContainer

        const dockContainerRect = this.dockManager.getContainerBoundingRect();
        domContentFrame.addClass("DockerTS-ContentFrame--Animating");
        if(this.panel.isHeaderVisible() === false) {
            // Get the initial header height for the animation purposes
            const domFrameHeader = this.panel.getFrameHeaderDOM();
            const height = domFrameHeader.getOffsetRect().h;
            this.panel.setHeaderVisibility(true);
            domFrameHeader.height(0);
            // Note: we need to force all updates - reason: we need to animate the height of the frame header
            DOMUpdateInitiator.forceEnqueuedDOMUpdates();

            await AnimationHelper.animateMaximizeNoHeader(domContentFrame.get(), domFrameHeader.get(), height, {
                x: dockContainerRect.left, y: dockContainerRect.top, w: dockContainerRect.width, h: dockContainerRect.height
            });
            // Remove element CSS property value for the height
            domFrameHeader.height("");
        } else {
            await AnimationHelper.animateMaximize(this.panel.getContentFrameDOM().get(), {
                x: dockContainerRect.left, y: dockContainerRect.top, w: dockContainerRect.width, h: dockContainerRect.height
            });    
        }       
        domContentFrame.removeClass("DockerTS-ContentFrame--Animating");

        // Update the target size after animation
        domContentFrame.applyRect(dockContainerRect);
    }

    public async leaveState(): Promise<void> {
        this.stopSizeObservation();
        // Reset the element zIndex CSS style
        const domContentFrame = this.panel.getContentFrameDOM();
        // Set zIndex to DockedState value
        domContentFrame.zIndex("1");
        // To update zIndex values in the nested panels of TabbedPanelContainer
        this.panel.updateLayoutState(); 
    }

    public dispose(): void {
        this.stopSizeObservation();
    }

    // TODO: ENTER STATE OF MINIMIZED STATE - MOVE IT
    async minimize(): Promise<boolean> {
        const domContentFrame = this.panel.getContentFrameDOM();
        const minimizedFreeSlot = this.dockManager.getNextFreeMinimizedSlotRect();
        await AnimationHelper.animateMinimize(domContentFrame.get(), minimizedFreeSlot);
        domContentFrame.addClass("DockerTS-ContentFrame--Minimized");
        return true;        
    }

    // Note: Restore process can go back to either Floating State or Docked State
    async restore(): Promise<boolean> {
        // Get the state settings before the maximization
        const previousState = this.config.get("restoreState", PanelContainerState.Docked);
        const wasHeaderVisible = this.config.get("wasHeaderVisible", true);
        // Get the previous bounds
        let originalRect: IRect = this.config.get("originalRect");
        if(previousState === PanelContainerState.Docked) {
            originalRect = this.panel.getPlaceholderDOM().getBoundsRect();
        }

        const domContentFrame = this.panel.getContentFrameDOM();

        this.startSizeObservation();

        domContentFrame.addClass("DockerTS-ContentFrame--Animating");
        if(previousState === PanelContainerState.Docked) {
            if(wasHeaderVisible === false) {
                const domHeader = this.panel.getFrameHeaderDOM();
                await AnimationHelper.animateRestoreNoHeader(domContentFrame.get(), domHeader.get(), originalRect);;
                domHeader.height("");   
            } else {
                await AnimationHelper.animateRestore(domContentFrame.get(), originalRect);
            }
            domContentFrame.applyRect(originalRect);
        } else if(previousState === PanelContainerState.Floating) {
            await AnimationHelper.animateRestore(domContentFrame.get(), originalRect);
            domContentFrame.applyRect(originalRect);
            // // TODO: MOVE TO ENTER STATE OF FLOATING???
            //DOMUpdateInitiator.forceAllEnqueuedUpdates();
            const dialog: Dialog = this.config.get("panelDialog");
            DOM.from(dialog.getDialogFrameDOM()).applyRect(originalRect);
            dialog.show();
            this.panel.updateLayoutState();
        }
        domContentFrame.removeClass("DockerTS-ContentFrame--Animating");

        this.stopSizeObservation();
        this.panel.setHeaderVisibility(wasHeaderVisible);


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
