import { DockManager } from "../DockManager";
import { IDockContainer, OrientationKind } from "../common/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";


export class ColumnLayoutDockContainer extends SplitterDockContainer {

    constructor(private dockManager: DockManager, childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Column);
    }

}
