import { IPanelAPI } from "./common/panel-api";
import { PanelContainer } from "./containers/PanelContainer";
import { Dialog } from "./floating/Dialog";
import { DockManagerContext } from "./model/DockManagerContext";
import { DockNode } from "./model/DockNode";


export class DockManager {

    getContainerBoundingRect(): DOMRect {
        throw 0;
    }

    queryPanelAPI(panelName: string): IPanelAPI {
        throw 0;
    }

    getDialogRootElement(): HTMLElement {
        throw 0;
    }

    invalidate() {

    }

    getModelContext(): DockManagerContext {
        throw 0;
    }

    notifyOnChangeDialogPosition(dialog: Dialog, x: number, y: number) {

    }

    notifyOnCreateDialog(dialog: Dialog) {

    }

    notifyOnDock(node: DockNode) {
        
    }

    notifyOnUnDock(node: DockNode) {

    }

    setActivePanel(panel: PanelContainer) {

    }

    nextDialogZIndex(): number {
        throw 0;
    }
    
}