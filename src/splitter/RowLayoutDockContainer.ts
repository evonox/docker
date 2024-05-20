import { DockManager } from "../facade/DockManager";
import { IDockContainer, OrientationKind } from "../common/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";


export class RowLayoutDockContainer extends SplitterDockContainer {

    constructor(private dockManager: DockManager, childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Row);
    }

}
