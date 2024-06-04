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
    }

    getMinimumChildNodeCount(): number {
        return 0;
    }
}
