import { IPanelAPI } from "./common/panel-api";
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

    notifyOnDock(node: DockNode) {
        
    }

    notifyOnUnDock(node: DockNode) {

    }
    
}