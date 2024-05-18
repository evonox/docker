import { IDockContainer, OrientationKind } from "../model/declarations";
import { SplitterDockContainer } from "./SplitterDockContainer";


export class RowLayoutDockContainer extends SplitterDockContainer {

    constructor(childContainers: IDockContainer[]) {
        super(childContainers, OrientationKind.Row);
    }

}
