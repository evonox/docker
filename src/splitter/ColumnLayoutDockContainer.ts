import { IDockContainer, OrientationKind } from "../model/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";


export class ColumnLayoutDockContainer extends SplitterDockContainer {

    constructor(childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Column);
    }

}
