import { TabOrientation } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { FillDockContainer } from "./FillDockContainer";

/**
 * Document Manager Container is just a special type of FillDockContainer
 */
export class DocumentManagerContainer extends FillDockContainer {

    constructor(dockManager: DockManager) {
        super(dockManager, TabOrientation.Top);
    }

    getMinimumChildNodeCount(): number {
        return 0;
    }
}
