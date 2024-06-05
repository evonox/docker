import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { PanelStateBase } from "./PanelStateBase";

/**
 * Maximized State Behavior of Panel Container
 */
export class MaximizedState extends PanelStateBase {

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);        
        // Note: Minimization not supported when we come from the Docked State
        const restoreState = this.config.get("restoreState");
        this.configureButtons({
            minimize: restoreState === PanelContainerState.Floating,
            restore: true, maximize: false, expand: false, collapse: false
        })

        // Move the maximized panel to the TOP of viewport
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(this.dockManager.config.zIndexes.zIndexMaximizedPanel);
        this.panel.updateLayoutState(); // To update nested panels of TabbedPanelContainer      

        // Observe container element for resize changes
        const containerElement = this.dockManager.getContainerElement();
        this.observeElement(containerElement, () => this.adjustMaximizedElementRect());
    }

    public async leaveState(): Promise<void> {
        const domContentFrame = this.panel.getContentFrameDOM();
        domContentFrame.zIndex(1);
        // To update zIndex values in the nested panels of TabbedPanelContainer
        this.panel.updateLayoutState(); 

        await super.leaveState();
    }

    async minimize(): Promise<boolean> {
        return true;        
    }

    async restore(): Promise<boolean> {
        return true;

        // TODO: MOVE TO FLOATING STATE
        // const dialog: Dialog = this.config.get("panelDialog");
        // DOM.from(dialog.getDialogFrameDOM()).applyRect(originalRect);
        // dialog.show();
        // this.panel.updateLayoutState();

        // TODO: MOVE TO DOCKED STATE        
        //this.panel.setHeaderVisibility(wasHeaderVisible);

    }

    public updateState(): void {}

    private adjustMaximizedElementRect() {
        const dockContainerBounds = this.dockManager.getContainerBoundingRect();
        this.panel.getContentContainerDOM().applyRect(dockContainerBounds);
    }

    // TODO: IS THIS NEEDED???
    public resize(rect: IRect) {}
}
