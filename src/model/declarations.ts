import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";


export enum TabHostDirection { Top, Bottom, Left, Right };

export enum ContainerType { Panel }

export interface IDockContainer {
    hasChanges(): boolean;

    setVisible(visible: boolean): void;

    resize(width: number, height: number): void;

    getContainerType(): ContainerType;


    // Event Handling
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;
    off(eventName: string): void;
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;

}
