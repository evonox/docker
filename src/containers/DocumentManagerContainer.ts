import { TabOrientation } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { DOM } from "../utils/DOM";
import { FillDockContainer } from "./FillDockContainer";

/**
 * Document Manager Container is just a special type of FillDockContainer
 */
export class DocumentManagerContainer extends FillDockContainer {

    constructor(dockManager: DockManager) {
        super(dockManager, TabOrientation.Top);
        DOM.from(this.getDOM()).addClass("DockerTS-DocumentManager");        
        this.tabHost.enableNewDocumentButton = false;
        this.tabHost.on("onNewDocument", () => this.handleOnNewDocumentClicked());
    }

    enableAddDocumentButton(flag: boolean) {
        this.tabHost.enableNewDocumentButton = flag;
    }

    getMinimumChildNodeCount(): number {
        return 0;
    }

    private handleOnNewDocumentClicked() {
        this.dockManager.triggerAddDocumentHandler();
    }
}
