import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PanelStateBase } from "./PanelStateBase";

/**
 * Minimized State of Panel Container
 */
export class MinimizedState extends PanelStateBase {

    private minimizingSlotId = 0;

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            minimize: false, maximize: true, restore: true, expand: false, collapse: false
        });

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.addClass("DockerTS-ContentFrame--Minimized");

        this.minimizingSlotId = this.dockManager.requestMinimizeSlot();
        this.updateMinimizedSlotPosition();
    }

    public async leaveState(): Promise<void> {
        // Clean up applied CSS element styles
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex("").removeClass("DockerTS-ContentFrame--Minimized").css("right", "");
        // Release the minimization slot
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

        this.applyCurrentRectToContentFrame();
       return true;
    }

    async restore(): Promise<boolean> {
        this.applyCurrentRectToContentFrame();
        return true;
    }

    public updateState(): void {
        super.updateState();
        this.updateMinimizedSlotPosition();
    }

    private applyCurrentRectToContentFrame() {
        // For animation purposes we need to apply to CSS positioning attributes of the current position
        const domContentFrame = this.panel.getContentFrameDOM();
        const currentRect: IRect = domContentFrame.getComputedRect();
        domContentFrame.applyRect(currentRect);
    }

    private updateMinimizedSlotPosition() {
        const domContentFrame = this.panel.getContentFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const slotPropertyName = this.dockManager.getSlotCSSPropertyName(this.minimizingSlotId);

        domContentFrame.left("").top("")
            .width("").height(domFrameHeader.getHeight())
            .css("right", `var(${slotPropertyName})`);
    }

    // TODO: IS THIS NEEDED???
    public resize(rect: IRect) {}
}
