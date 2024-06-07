import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PanelStateBase } from "./PanelStateBase";

/**
 * Minimized State of Panel Container
 */
export class MinimizedState extends PanelStateBase {

    private minimizingSlotId = 0;
    private isCapturedInMinimizingSlot = false;

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            minimize: false, maximize: true, restore: true, expand: false, collapse: false, popup: false, pin: false
        });

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.addClass("DockerTS-ContentFrame--Minimized");

        this.isCapturedInMinimizingSlot = true;
        this.minimizingSlotId = this.dockManager.requestMinimizeSlot();
        this.updateMinimizedSlotPosition();
    }

    public async leaveState(): Promise<void> {
        // For animation purposes we need to apply to CSS positioning attributes of the current position
        const domContentFrame = this.panel.getContentFrameDOM();
        const currentRect: IRect = domContentFrame.getComputedRect();
        domContentFrame.zIndex("").removeClass("DockerTS-ContentFrame--Minimized")
            .css("right", "").applyRect(currentRect);       
            
        // Release the minimization slot
        this.isCapturedInMinimizingSlot = false;
        this.dockManager.releaseMinimizeSlot(this.minimizingSlotId);      

        await super.leaveState();
    }

    public dispose(): void {
        this.dockManager.releaseMinimizeSlot(this.minimizingSlotId);       
        super.dispose();
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("wasHeaderVisible", true);
        return true;
    }

    async restore(): Promise<boolean> {
        return true;
    }

    public updateState(): void {
        super.updateState();
        if(this.isCapturedInMinimizingSlot) {
            this.updateMinimizedSlotPosition();
        }
    }
 
    private updateMinimizedSlotPosition() {
        const domContentFrame = this.panel.getContentFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const slotPropertyName = this.dockManager.getSlotCSSPropertyName(this.minimizingSlotId);

        domContentFrame.left("").top("")
            .width("").height(domFrameHeader.getHeight())
            .css("right", `var(${slotPropertyName})`);
    }
}
