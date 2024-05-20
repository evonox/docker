import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { IState } from "./serialization";

export const MOUSE_BTN_LEFT = 0;
export const MOUSE_BTN_MIDDLE = 1;
export const MOUSE_BTN_RIGHT = 2;

export enum DockKind { Left, Right, Up, Down, Fill };

export enum OrientationKind { Row = "row", Column = "column", Fill = "fill" };

export enum TabHostDirection { Top = "top", Bottom = "bottom", Left = "left", Right = "right" };

export enum ContainerType { Panel = "panel", RowLayout = "row", ColumnLayout = "column", FillLayout = "fill" }

export enum PanelType { Document = "document", Panel = "panel" }

export interface IPoint {
    x: number;
    y: number;
}

export interface ISize {
    w: number;
    h: number;
}

export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface IDeltaPoint {
    dx: number;
    dy: number;
}

export interface IDeltaRect {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}

/**
 * TODO: PERSISTENCE OF UI
 */
export interface IDockContainer {

    dispose(): void;

    getDOM(): HTMLElement;

    hasChanges(): boolean;

    getMinimumChildNodeCount(): number;
    setActiveChild(container: IDockContainer): void;

    setVisible(visible: boolean): void;

    getMinWidth(): number;
    getMinHeight(): number;

    getWidth(): number;
    getHeight(): number;

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;    
    resize(width: number, height: number): void;

    getContainerType(): ContainerType;

    saveState(state: IState): void;
    loadState(state: IState): void;   

    // Event Handling
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;
    off(eventName: string): void;
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;

}
