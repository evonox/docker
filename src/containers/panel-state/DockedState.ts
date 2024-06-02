import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { RectHelper } from "../../utils/rect-helper";
import { PanelStateBase } from "./PanelStateBase";

export class DockedState extends PanelStateBase {

    private panelPlaceholderRO: ResizeObserver = undefined;

    public enterState(): void {
        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, false);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, false);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);

        this.startSizeObservation();
    }

    public leaveState(): void {
        this.stopSizeObservation();
    }

    public dispose(): void {
        
    }

    async floatPanel(dialog: Dialog): Promise<boolean> {
        if(this.config.get("lastFloatingRect") === undefined) {
            const defaultPanelSizeMagnitude = this.dockManager.config.defaultPanelSizeMagnitude;
            const floatWidth = this.panel.getMinWidth() * defaultPanelSizeMagnitude;
            const floatHeight = this.panel.getMinHeight() * defaultPanelSizeMagnitude;
            const rect: IRect = RectHelper.from(0, 0, floatWidth, floatHeight);
            this.config.set("lastFloatingRect", rect);
        }
        return true;
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Docked);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());

        const domFrame = this.panel.getContentFrameDOM().get();

        const cssStyle = window.getComputedStyle(domFrame)
        const rect: IRect = {
            x: parseFloat(cssStyle.left),
            y: parseFloat(cssStyle.top),
            w: parseFloat(cssStyle.width),
            h: parseFloat(cssStyle.height)
        };
        this.config.set("originalRect", rect);

        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel)

        this.panel.updateLayoutState();
        
        const viewportRect = this.dockManager.getContainerBoundingRect();
        if(this.panel.isHeaderVisible() === false) {
            const domFrameHeader = this.panel.getFrameHeaderDOM().get();
            this.panel.setHeaderVisibility(true);
            // const height = DOM.from(domFrameHeader).getHeight();
            const height = domFrameHeader.offsetHeight;
            DOM.from(domFrameHeader).height(0);
            await AnimationHelper.animateMaximizeNoHeader(domFrame, domFrameHeader, height, {
                x: viewportRect.left, y: viewportRect.top, w: viewportRect.width, h: viewportRect.height
            });
            DOM.from(domFrameHeader).height("");

        } else {
            await AnimationHelper.animateMaximize(this.panel.getContentFrameDOM().get(), {
                x: viewportRect.left, y: viewportRect.top, w: viewportRect.width, h: viewportRect.height
            });    
        }       

        return true;
    }

    public updateLayoutState(): void {
        if(this.panel.isHidden())
            return;
        super.updateLayoutState();
    }

    public updatePanelState(): void {
         super.updatePanelState();
    }

    public resize(rect: IRect) {
        if(RectHelper.isSizeOnly(rect)) {
            this.panel.getContentFrameDOM().applySize(rect);
        } else {
            this.panel.getContentFrameDOM().applyRect(rect);       
        }
    }

    private startSizeObservation() {
        this.panelPlaceholderRO = new ResizeObserver((entries) => {
            const rect = this.panel.getPlaceholderDOM().getBoundingClientRect();
            this.panel.getContentFrameDOM().applyRect(rect);
        });

        const domPlaceholderDOM = this.panel.getPlaceholderDOM().get();
        this.panelPlaceholderRO.observe(domPlaceholderDOM, {box: "border-box"});       
    }

    private stopSizeObservation() {
        if(this.panelPlaceholderRO !== undefined) {
            const domPlaceholderDOM = this.panel.getPlaceholderDOM().get();
            this.panelPlaceholderRO.unobserve(domPlaceholderDOM);       
            this.panelPlaceholderRO.disconnect();
            this.panelPlaceholderRO = undefined;   
        }
    }

}
