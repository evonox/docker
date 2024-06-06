import type { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import type { DockNode } from "../model/DockNode";
import type { IRect, ISize } from "./dimensions";
import type { ContainerType, DockKind } from "./enumerations";
import type { IContextMenuAPI } from "./panel-api";
import type { IState } from "./serialization";

/**
 * Interface containing the container dock information
 */

export interface IDockInfo {
    referenceNode: DockNode;
    dockKind: DockKind;
    ratio?: number;
}

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
    getChildContainers(): IDockContainer[];

    // Visibility and active child selection
    setActiveChild(container: IDockContainer): void;    
    setVisible(visible: boolean): void;
    isHidden(): boolean;
    setHeaderVisibility(visible: boolean): void;
    updateState(): void;

    // Cleanup
    dispose(): void;

    // On Query Panel Context Menu
    onQueryContextMenu(config: IContextMenuAPI): void;
    handleContextMenuAction(actionName: string): void;


    // Dimensions / Resizing & Layouting
    getWidth(): number;
    getHeight(): number;

    getMinWidth(): number;
    getMinHeight(): number;

    queryLoadedSize(): ISize;

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;    
    resize(rect: IRect): void;

    // Persitence Management
    saveState(state: IState): void;
    loadState(state: IState): void;   
}
