import { DockManager } from "../facade/DockManager";
import { IDockContainer } from "../common/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";
import { OrientationKind } from "../common/enumerations";
import { SplitterPanelBase } from "./SplitterPanelBase";
import { RowSplitterPanel } from "./RowSplitterPanel";


export class RowLayoutDockContainer extends SplitterDockContainer {

    constructor(private dockManager: DockManager, childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Row);
    }

    protected createSplitterPanel(containers: IDockContainer[]): SplitterPanelBase {
        return new RowSplitterPanel(containers);
    }
}
