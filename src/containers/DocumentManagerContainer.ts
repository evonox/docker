import { TabOrientation } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { FillDockContainer } from "./FillDockContainer";


export class DocumentManagerContainer extends FillDockContainer {

    constructor(dockManager: DockManager) {
        super(dockManager, TabOrientation.Top);
    }
}
