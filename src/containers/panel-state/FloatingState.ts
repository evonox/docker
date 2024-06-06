import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PANEL_ACTION_COLLAPSE, PANEL_ACTION_EXPAND, PANEL_ACTION_MAXIMIZE, PANEL_ACTION_MINIMIZE, PANEL_ACTION_RESTORE } from "../../core/panel-default-buttons";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { DOM } from "../../utils/DOM";
import { AnimationHelper } from "../../utils/animation-helper";
import { PanelContainer } from "../PanelContainer";
import { PanelStateBase } from "./PanelStateBase";
import { SharedStateConfig } from "./SharedStateConfig";

/**
 * Floating State of the Panel Container - TODO: REVIEW THIS
 */
export class FloatingState extends PanelStateBase {

    private isCollapsed: boolean;
    private lastDialogExpandedHeight: number;
    private lastContentExpandedHeight: number;


    constructor(dockManager: DockManager, panel: PanelContainer, config: SharedStateConfig, private dialog: Dialog) {
        super(dockManager, panel, config);
    }

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);

        // TODO: REVIEW THIS
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

        this.configureButtons({
            minimize: true, maximize: true, restore: false, expand: false, collapse: true, popup: false
        });
        this.panel.updateState();
        this.dialog.show();

        const domDialogFrame = this.dialog.getDialogFrameDOM();
        this.observeElement(domDialogFrame, () => this.adjustPanelContentState());
    }

    public async leaveState(): Promise<void> {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(1);
        this.panel.updateState();

        this.dialog.hide();

        await super.leaveState();
    }

    async dockPanel(): Promise<boolean> {
        return true;    
    }

    async maximize(): Promise<boolean> {
        if(this.isCollapsed) {
            await this.expand(true);
        }

        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("panelDialog", this.dialog);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());
        
        const rect = DOM.from(this.dialog.getDialogFrameDOM()).getComputedRect();
        this.config.set("lastFloatingRect", rect);
        this.config.set("originalRect", rect);

        return true;
    }

    public async minimize(): Promise<boolean> {
        if(this.isCollapsed) {
            await this.expand(true);
        }

        const rect = DOM.from(this.dialog.getDialogFrameDOM()).getComputedRect();
        this.config.set("lastFloatingRect", rect);
        this.config.set("restoreState", PanelContainerState.Floating);
        this.config.set("panelDialog", this.dialog);
        this.config.set("originalRect", rect);
        
        return true;
    }

    public async expand(doAnimation?: boolean): Promise<boolean> {
        // Perform initial checks prior the animation
        if(doAnimation === undefined) {
            doAnimation = true;
        }
        if(! this.isCollapsed)
            return false;
        this.isCollapsed = false;

        // Reconfigure expand / collapse button visibility
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, false);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, true);

        // Query the needed DOM references and info for the animation
        const domDialogFrame = this.dialog.getDialogFrameDOM();
        const domContentContainer = this.panel.getContentContainerDOM();

        // Perform the Expand animation
        if(doAnimation === true) {
            await AnimationHelper.animatePanelExpand(domDialogFrame, domContentContainer.get(), 
            this.lastDialogExpandedHeight, this.lastContentExpandedHeight);
        }

        // Final CSS style setting and cleanup
        DOM.from(domDialogFrame).height(this.lastDialogExpandedHeight);
        domContentContainer.height("").css("opacity", "");

        // Enable resizing behavior on the dialog frame
        this.panel.triggerEvent("onEnableResize", true);
    }

    public async collapse(doAnimation?: boolean): Promise<boolean> {
        // Perform initial checks prior the animation
        if(doAnimation === undefined) {
            doAnimation = true;
        }
        if(this.isCollapsed)
            return false;
        this.isCollapsed = true;

        // Reconfigure expand / collapse button visibility
        this.panel.showHeaderButton(PANEL_ACTION_EXPAND, true);
        this.panel.showHeaderButton(PANEL_ACTION_COLLAPSE, false);

        // Disabled resizing behavior on the dialog frame
        this.panel.triggerEvent("onEnableResize", false);

        // Query the needed DOM references and info for the animation
        const domDialogFrame = this.dialog.getDialogFrameDOM();
        const domFrameHeader = this.panel.getFrameHeaderDOM();
        const domContentContainer = this.panel.getContentContainerDOM();
        const headerHeight = domFrameHeader.getOffsetRect().h;

        // Perform the Collapse animation
        this.lastDialogExpandedHeight = DOM.from(domDialogFrame).getHeight();
        this.lastContentExpandedHeight = domContentContainer.getHeight();
        if(doAnimation === true) {
            await AnimationHelper.animatePanelCollapse(domDialogFrame, domContentContainer.get(), headerHeight);
        }

        // Final CSS style setting and cleanup
        DOM.from(domDialogFrame).height(headerHeight);
    }

    updateState(): void {
        const zIndex = DOM.from(this.dialog.getDialogFrameDOM()).getZIndex();
        this.panel.getContentFrameDOM().zIndex(zIndex - 2);

        this.adjustPanelContentState();
        super.updateState();
    }

    private adjustPanelContentState() {
        const rect = DOM.from(this.dialog.getDialogFrameDOM()).getBoundsRect();
        this.panel.getContentFrameDOM().applyRect(rect);
    }
}
