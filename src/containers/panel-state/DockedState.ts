import { PanelContainerState } from "../../common/enumerations";
import { Dialog } from "../../floating/Dialog";
import { PanelStateBase } from "./PanelStateBase";


export class DockedState extends PanelStateBase {

    private panelPlaceholderRO: ResizeObserver;

    public enterState(): void {
        this.panelPlaceholderRO = new ResizeObserver((entries) => {
            this.updateLayoutState();
        });

        const domPlaceholder = this.panel.getPlaceholderDOM();
        this.panelPlaceholderRO.observe(domPlaceholder.get());       
    }

    public leaveState(): void {
        const domPlaceholder = this.panel.getPlaceholderDOM();
        this.panelPlaceholderRO.unobserve(domPlaceholder.get());       
        this.panelPlaceholderRO.disconnect();
        this.panelPlaceholderRO = undefined;
    }

    public dispose(): void {
        
    }

    async floatPanel(dialog: Dialog): Promise<boolean> {
        return true;
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Docked);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)

        this.panel.setHeaderVisibility(true);

        return true;
    }



    public updateLayoutState(): void {
        if(this.panel.isHidden())
            return;
        super.updateLayoutState();

        const rect = this.panel.getPlaceholderDOM().getBounds();
        this.panel.getContentFrameDOM().applyRect(rect);
    }

    public updatePanelState(): void {
         super.updatePanelState();
    }
}