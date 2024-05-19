import { ContainerType, IPoint, PanelType } from "./declarations";

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
    width?: number;
    height?: number;
    documentManager?: boolean;
    element?: string; // NOTE: WILL THIS BE NEEDED????
    canUndock?: boolean;
    hideCloseButton?: boolean;
    panelType?: PanelType;
}
