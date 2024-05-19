import { ContainerType, IPoint } from "../common/declarations";
import { IState } from "../common/serialization";



export class PanelContainer {

    getContainerType(): ContainerType {
        throw 0;
    }

    getPosition(): IPoint {
        throw 0;
    }

    isHidden(): boolean {
        throw 0;
    }

    saveState(state: IState): void {

    }

}