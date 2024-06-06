import { TabOrientation } from "../common/enumerations";
import { ITabbedPanelStateAPI, TabOrientationType } from "../common/panel-api";
import { TabbedPanelContainer } from "../containers/TabbedPanelContainer";
import { PanelStateAdapter } from "./PanelStateAdapter";

/**
 * Adapter for TabbedPanel tate API
 */
export class TabbedPanelStateAdapter extends PanelStateAdapter implements ITabbedPanelStateAPI {

    constructor(private tabbedPanelContainer: TabbedPanelContainer) {
        super(tabbedPanelContainer);
    }
    setTabOrientation(orientationType: TabOrientationType): void {
        const orientation = this.convertTabOrientation(orientationType);
        this.tabbedPanelContainer.setTabOrientation(orientation);
    }

    private convertTabOrientation(orientation: TabOrientationType): TabOrientation {
        switch(orientation) {
            case "top": return TabOrientation.Top;
            case "bottom": return TabOrientation.Bottom;
            case "left": return TabOrientation.Left;
            case "right": return TabOrientation.Right;
        }
    }
}
