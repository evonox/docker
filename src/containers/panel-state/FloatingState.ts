import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { PanelContainer } from "../PanelContainer";
import { PanelStateBase } from "./PanelStateBase";
import { SharedStateConfig } from "./SharedStateConfig";


export class FloatingState extends PanelStateBase {

    private dialogFrameRO: ResizeObserver;


    constructor(dockManager: DockManager, panel: PanelContainer, config: SharedStateConfig, private dialog: Dialog) {
        super(dockManager, panel, config);
    }

    public enterState(): void {
        if(this.dialog === undefined) {
            this.dialog = this.config.get("panelDialog");
        }

        this.dialogFrameRO = new ResizeObserver((entries) => {
            this.updateLayoutState();
        });

        const domDialogFrame = this.dialog.getDialogFrameDOM();
        this.dialogFrameRO.observe(domDialogFrame);       

        const previousPosition =  this.config.get("dialogPosition");
        if(previousPosition !== undefined) {
            const domDialog = this.dialog.getDialogFrameDOM();
            DOM.from(domDialog).applyRect(previousPosition);
        }

        this.dialog.bringToFront();

        // this.setVisible(true);
        // this.updatePanelState();
        // this.updateLayoutState();

    }

    public leaveState(): void {
        const domDialogFrame = this.dialog.getDialogFrameDOM();
        this.dialogFrameRO.unobserve(domDialogFrame);       
        this.dialogFrameRO.disconnect();
        this.dialogFrameRO = undefined;
       
    }

    public dispose(): void {
        
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("panelDialog", this.dialog);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());
        
        // TODO: SAVE PREVIOUS POSITION
        const cssStyle = window.getComputedStyle(this.dialog.getDialogFrameDOM())
        const rect: IRect = {
            x: parseFloat(cssStyle.left),
            y: parseFloat(cssStyle.top),
            w: parseFloat(cssStyle.width),
            h: parseFloat(cssStyle.height)
        };
        this.config.set("dialogPosition", rect);


        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)


        return true;
    }


    public updateLayoutState(): void {
        // TODO: REWORK TO DOM HELPER getComputedRect
        const cssStyle = window.getComputedStyle(this.dialog.getDialogFrameDOM())
        this.panel.getContentFrameDOM().applyRect({
            x: parseFloat(cssStyle.left),
            y: parseFloat(cssStyle.top),
            w: parseFloat(cssStyle.width),
            h: parseFloat(cssStyle.height)
        });
    }

    public updatePanelState(): void {
        super.updatePanelState();
        
        const zIndex = DOM.from(this.dialog.getDialogFrameDOM()).getZIndex();
        this.panel.getContentFrameDOM().zIndex(zIndex);
    }
}
