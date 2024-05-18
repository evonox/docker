import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";

export enum OrientationKind { Row, Column };

export enum TabHostDirection { Top, Bottom, Left, Right };

export enum ContainerType { Panel, RowLayout, ColumnLayout, FillLayout }

export interface IPoint {
    x: number;
    y: number;
}

export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
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

    setVisible(visible: boolean): void;

    getMinWidth(): number;
    getMinHeight(): number;

    getWidth(): number;
    getHeight(): number;

    performLayout(children: IDockContainer[]): void;    
    resize(width: number, height: number): void;

    getContainerType(): ContainerType;


    // Event Handling
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;
    off(eventName: string): void;
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;

}
