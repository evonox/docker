import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { RectHelper } from "../../utils/rect-helper";
import { PanelStateBase } from "./PanelStateBase";

export class DockedState extends PanelStateBase {

    private panelPlaceholderRO: ResizeObserver;

    public enterState(): void {
        this.panelPlaceholderRO = new ResizeObserver((entries) => {
            // TODO: DEBUG WORKAROUND - There is infinite resizing loop. Not sure why?
            window.requestAnimationFrame(() => {
                this.updateLayoutState();
            });
        });

        const domPlaceholder = this.panel.getPlaceholderDOM();
        this.panelPlaceholderRO.observe(domPlaceholder.get(), {box: "border-box"});

        this.panel.showHeaderButton(PANEL_ACTION_MINIMIZE, false);
        this.panel.showHeaderButton(PANEL_ACTION_RESTORE, false);
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);
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
        DOM.from(dialog.getDialogFrameDOM()).width(500).height(200);
        this.updateLayoutState();
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

        // Note: The returned coordinates might not be the whole numbers
        // To prevent content flickering we "floor" them
        let rect = this.panel.getPlaceholderDOM().getBoundsRect();
        rect = RectHelper.floor(rect);
        this.panel.getContentFrameDOM().applyRect(rect);
    }

    public updatePanelState(): void {
         super.updatePanelState();
    }
}