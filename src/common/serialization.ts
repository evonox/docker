import { IPoint } from "./dimensions";
import { ContainerType } from "./enumerations";

/**
 * Serialization Data Interfaces
 */

export interface INodeInfo {
    containerType: ContainerType;
    state: IState;
    children: INodeInfo[];
}

export interface IPanelInfo {
    containerType: ContainerType;
    state: IState;
    position: IPoint;
    isHidden: boolean;
}

export interface IState {
    panelName?: string,
    width?: number;
    height?: number;
    documentManager?: boolean;
    element?: string; // NOTE: WILL THIS BE NEEDED????
    canUndock?: boolean;
    hideCloseButton?: boolean;
    panelClientState?: any;
}
