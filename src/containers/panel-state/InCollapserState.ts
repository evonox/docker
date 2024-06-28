import { Collapser } from "../../collapsers/Collapser";
import { IRect } from "../../common/dimensions";
import { ComponentEventSubscription } from "../../framework/component-events";
import { AutoDockHelper, IAutoDock } from "../../utils/auto-dock-helper";
import { PanelStateBase } from "./PanelStateBase";

/**
 * Represents the state when the panel is hidden in the collapser
 */
export class InCollapserState extends PanelStateBase {

    private collapser: Collapser;
    private autoDock: IAutoDock;

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);

        this.configureButtons({
            minimize: false, maximize: false, restore: false, expand: false, collapse: false, popup: false, pin: true
        });

        const domFrameContainer = this.panel.getContentFrameDOM();
        const panelRect = domFrameContainer.getBoundsRect();


        this.autoDock = AutoDockHelper.scanDockInfo(this.dockManager, this.panel);
        this.dockManager.requestUndock(this.panel);
        this.panel.updateState();
        this.panel.setHeaderVisibility(true);
        this.panel.setVisible(false);

        const collapserDock = this.autoDock.getCollapserDockKind();
        this.collapser = new Collapser(this.dockManager, this.panel, collapserDock, panelRect);

        this.collapser.on("onShowPanel", () => this.handlePanelShown());
        this.collapser.on("onHidePanel", () => this.handlePanelHidden());
        
        this.dockManager.notifyOnUnpinned(this.panel);
    }

    public async leaveState(): Promise<void> {
        this.autoDock.restoreDock();
        this.autoDock.dispose();

        this.collapser.dispose();
        await super.leaveState();

        this.dockManager.notifyOnPinned(this.panel);
    }

    public dispose(): void {
        this.autoDock.dispose();
        this.collapser.dispose();
    }

    async pinPanel(): Promise<boolean> {
        return true;
    }

    updateState(): void {
        // Note: Not initialized yet
        if(this.collapser === undefined)
            return;
        // const domPanelPlacehoder = this.collapser.getPanelPlaceholderDOM();
        const domFrameContainer = this.panel.getContentFrameDOM();
        // let rect = domPanelPlacehoder.getBoundsRect();
        // rect = this.dockManager.adjustToFullWindowRelative(rect);
        //domFrameContainer.applyRect(rect).zIndex(3);
        domFrameContainer.zIndex(3);
        super.updateState();
    }

    public updateLayout(rect?: IRect): void {
        if(this.collapser === undefined)
            return;
        const domFrameContainer = this.panel.getContentFrameDOM();
        domFrameContainer.applyRect(rect);
    }


    private handlePanelShown() {
        this.panel.setVisible(true);
    }

    private handlePanelHidden() {
        this.panel.setVisible(false);
    }
}
