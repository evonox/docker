import { DockManager } from "../facade/DockManager";
import { IDockContainer } from "../common/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";
import { OrientationKind } from "../common/enumerations";


export class ColumnLayoutDockContainer extends SplitterDockContainer {

    constructor(private dockManager: DockManager, childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Column);
    }

}
