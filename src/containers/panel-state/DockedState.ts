import { IRect } from "../../common/dimensions";
import { PanelContainerState } from "../../common/enumerations";
import { Dialog } from "../../floating/Dialog";
import { DOMUpdateInitiator } from "../../utils/DOMUpdateInitiator";
import { RectHelper } from "../../utils/rect-helper";
import { PanelStateBase } from "./PanelStateBase";

/**
 * Docked State of the Panel Container
 */
export class DockedState extends PanelStateBase {

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            minimize: false, maximize: true, restore: false, expand: false, collapse: false
        });

        const wasHeaderVisible = this.config.get("wasHeaderVisible");
        this.panel.setHeaderVisibility(wasHeaderVisible);

        const domPlaceholderDOM = this.panel.getPlaceholderDOM().get();
        this.observeElement(domPlaceholderDOM, () => this.adjustPanelContentSize());
    }

    public async leaveState(): Promise<void> {
        await super.leaveState();
    }

    // TODO: REFACTOR
    async floatPanel(dialog: Dialog): Promise<boolean> {
        if(this.config.get("lastFloatingRect") === undefined) {
            const minimumWidth = this.dockManager.config.minimumDefaultWidth;
            const minimumHeight = this.dockManager.config.minimumDefaultHeight;
            const defaultPanelSizeMagnitude = this.dockManager.config.defaultPanelSizeMagnitude;
            const floatWidth = Math.max(this.panel.getMinWidth() * defaultPanelSizeMagnitude, minimumWidth);
            const floatHeight = Math.max(this.panel.getMinHeight() * defaultPanelSizeMagnitude, minimumHeight);
            DOMUpdateInitiator.forceAllEnqueuedUpdates();
            const dialogPosition = dialog.getPosition();
            const rect: IRect = RectHelper.from(dialogPosition.x, dialogPosition.y, floatWidth, floatHeight);
            this.config.set("lastFloatingRect", rect);
        } else {
            const rect: IRect = this.config.get("lastFloatingRect");
            const dialogPosition = dialog.getPosition();
            rect.x = dialogPosition.x;
            rect.y = dialogPosition.y;
            this.config.set("lastFloatingRect", rect);
        }
        return true;
    }

    async maximize(): Promise<boolean> {
        this.config.set("restoreState", PanelContainerState.Docked);
        this.config.set("wasHeaderVisible", this.panel.isHeaderVisible());
        const rect = this.panel.getContentFrameDOM().getComputedRect();
        this.config.set("originalRect", rect);

        return true;
    }

    public updateState(): void {
        this.adjustPanelContentSize();
        super.updateState();
    }

    private adjustPanelContentSize() {
        let rect = this.panel.getPlaceholderDOM().getBoundsRect();     
        this.panel.getContentFrameDOM().applyRect(rect);
    }
}
