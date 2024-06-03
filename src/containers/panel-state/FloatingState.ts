import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelContainer } from "../PanelContainer";
import { PanelStateBase } from "./PanelStateBase";
import { SharedStateConfig } from "./SharedStateConfig";


export class FloatingState extends PanelStateBase {

    private dialogFrameRO: ResizeObserver = undefined;

    private isCollapsed: boolean;
    private lastDialogExpandedHeight: number;
    private lastContentExpandedHeight: number;


    constructor(dockManager: DockManager, panel: PanelContainer, config: SharedStateConfig, private dialog: Dialog) {
        super(dockManager, panel, config);
    }

    public enterState(): void {
        if(this.dialog === undefined) {
            this.dialog = this.config.get("panelDialog");
        }

        let previousPosition = this.config.get("lastFloatingRect");
        if(previousPosition === undefined) {
            previousPosition =  this.config.get("originalRect");
        }

        if(previousPosition !== undefined) {
            const domDialog = this.dialog.getDialogFrameDOM();
            DOM.from(domDialog).applyRect(previousPosition);
            this.panel.getContentFrameDOM().applyRect(previousPosition);
        }

        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, true);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, false);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, true);

        this.panel.updateLayoutState();

        this.dialog.bringToFront();
    }

    public leaveState(): void {
       this.stopSizeObservation();

       const domContentFrame = this.panel.getContentFrameDOM();
       domContentFrame.zIndex("0");
       this.panel.updateLayoutState();
       this.panel.updateContainerState();

       console.log("---- EXIT STATE ---");
    }

    public dispose(): void {
        this.stopSizeObservation();
    }

    private startSizeObservation() {
        this.dialogFrameRO = new ResizeObserver((entries) => {
            this.updateLayoutState();
        });

        const domDialogFrame = this.dialog.getDialogFrameDOM();
        this.dialogFrameRO.observe(domDialogFrame, {box: "border-box"});       
    }

    private stopSizeObservation() {
        if(this.dialogFrameRO !== undefined) {
            const domDialogFrame = this.dialog.getDialogFrameDOM();
            this.dialogFrameRO.unobserve(domDialogFrame);       
            this.dialogFrameRO.disconnect();
            this.dialogFrameRO = undefined;   
        }
    }

    async dockPanel(): Promise<boolean> {
        return true;    
    }

    async maximize(): Promise<boolean> {
        if(this.isCollapsed) {
            await this.expand(true);
        }

        this.dialog.hide();

        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("panelDialog", this.dialog);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());
        
        const rect = DOM.from(this.dialog.getDialogFrameDOM()).getComputedRect();
        this.config.set("lastFloatingRect", rect);
        this.config.set("originalRect", rect);

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel);

        const viewportRect = this.dockManager.getContainerBoundingRect();
        if(this.isCollapsed) {
            const domContent = this.panel.getContentContainerDOM();
            domContent.css("opacity", "1");
        }

        this.panel.updateLayoutState();

        await AnimationHelper.animateMaximize(domContentFrame.get(), {
            x: viewportRect.left, y: viewportRect.top, w: viewportRect.width, h: viewportRect.height
        });
        

        return true;
    }

    public async minimize(): Promise<boolean> {
        if(this.isCollapsed) {
            await this.expand(true);
        }

        this.dialog.hide();
        const domContentFrame = this.panel.getContentFrameDOM();

        const rect = DOM.from(this.dialog.getDialogFrameDOM()).getComputedRect();
        this.config.set("lastFloatingRect", rect);
        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("panelDialog", this.dialog);
        this.config.set("originalRect", rect);

        const minimizedFreeSlot = this.dockManager.getNextFreeMinimizedSlotRect();
        await AnimationHelper.animateMinimize(domContentFrame.get(), minimizedFreeSlot);
        domContentFrame.addClass("DockerTS-ContentFrame--Minimized");
        
        return true;
    }

    public async expand(doAnimation?: boolean): Promise<boolean> {
        if(doAnimation === undefined) {
            doAnimation = true;
        }
        if(! this.isCollapsed)
            return false;
        this.isCollapsed = false;

        const domDialogFrame = this.dialog.getDialogFrameDOM();
        DOM.from(domDialogFrame).css("border", "");
        const domContentContainer = this.panel.getContentContainerDOM();
        if(doAnimation === true) {
            await AnimationHelper.animatePanelExpand(domDialogFrame, domContentContainer.get(), 
            this.lastDialogExpandedHeight, this.lastContentExpandedHeight);
        }

        DOM.from(domDialogFrame).height(this.lastDialogExpandedHeight);
        domContentContainer.height("").css("opacity", "");

        this.panel.triggerEvent("onEnableResize", true);

        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, true);
    }

    public async collapse(doAnimation?: boolean): Promise<boolean> {
        if(doAnimation === undefined) {
            doAnimation = true;
        }
        if(this.isCollapsed)
            return false;
        this.isCollapsed = true;

        this.panel.triggerEvent("onEnableResize", false);

        const domDialogFrame = this.dialog.getDialogFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const domContentContainer = this.panel.getContentContainerDOM();

        // const headerHeight = domFrameHeader.getHeight();
        const headerHeight = domFrameHeader.get().offsetHeight;


        this.lastDialogExpandedHeight = DOM.from(domDialogFrame).getHeight();
        this.lastContentExpandedHeight = domContentContainer.getHeight();
        if(doAnimation === true) {
            await AnimationHelper.animatePanelCollapse(domDialogFrame, domContentContainer.get(), headerHeight);
        }
        DOM.from(domDialogFrame).css("border", "none");
        DOM.from(domDialogFrame).height(headerHeight);

        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, true);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);
    }


    public updatePanelState(): void {
        super.updatePanelState();
       
        const zIndex = DOM.from(this.dialog.getDialogFrameDOM()).getZIndex();
        this.panel.getContentFrameDOM().zIndex(zIndex);
    }

    public updateLayoutState(): void {
        // // TODO: REWORK TO DOM HELPER getComputedRect
        // const cssStyle = window.getComputedStyle(this.dialog.getDialogFrameDOM())
        // this.panel.getContentFrameDOM().applyRect({
        //     x: parseFloat(cssStyle.left),
        //     y: parseFloat(cssStyle.top),
        //     w: parseFloat(cssStyle.width),
        //     h: parseFloat(cssStyle.height)
        // });
    }


    public resize(rect: IRect) {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.applyRect(rect);
    }
}
