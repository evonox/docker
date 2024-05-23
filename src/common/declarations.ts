import type { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { ISize } from "./dimensions";
import { ContainerType } from "./enumerations";
import type { IContextMenuAPI } from "./panel-api";
import type { IState } from "./serialization";



/**
 * Interface for components having event support
 */
export interface IEventEmitter {
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;
    off(eventName: string): void;
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription;

}

/**
 * Generic Dock Container Interface
 */
export interface IDockContainer extends IEventEmitter {

    // Query Methods
    getDOM(): HTMLElement;
    getContainerType(): ContainerType;
    hasChanges(): boolean;
    getMinimumChildNodeCount(): number;

    // Visibility and active child selection
    setActiveChild(container: IDockContainer): void;    
    setVisible(visible: boolean): void;
    setHeaderVisibility(visible: boolean): void;
    updateContainerState(): void;

    // Cleanup
    dispose(): void;

    // On Query Panel Context Menu
    onQueryContextMenu(config: IContextMenuAPI): void;


    // Dimensions / Resizing & Layouting
    getWidth(): number;
    getHeight(): number;

    getMinWidth(): number;
    getMinHeight(): number;

    queryLoadedSize(): ISize;

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;    
    resize(width: number, height: number): void;

    // Persitence Management
    saveState(state: IState): void;
    loadState(state: IState): void;   
}
