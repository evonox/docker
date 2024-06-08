import type { DockManager } from "../facade/DockManager";

/**
 * Panel API Enumerations
 */

export type ViewInstanceType = "singleton" | "transient";

export type TabOrientationType = "top" | "bottom" | "left" | "right";


export interface PanelFactoryFunction {
    (dockManager: DockManager): IPanelAPI;
}

export interface TabbedPanelFactoryFunction {
    (dockManager: DockManager): ITabbedPanelAPI;
}

/**
 * Interface for Options Container containing initial options for a panel type
 */
export interface IInitOptions {
    getValue(key: string, defaultValue?: any): any;
}

/**
 * Subscription Interface for events regarding a panel itself
 */
export interface ISubscriptionAPI {
    unsubscribe(): void;
}

/**
 * Every panel will have possibility to save and load its state
 * It is important for panels of the same type to save the identity of its data
 */
export interface IPanelState {
    getValue(key: string, defaultValue?: any): any;
    setValue(key: string, value: any): void;
}

/**
 * Configuration interface for panels to have the ability to influence its context menu
 */
export interface IMenuItem {
    displayOrder: number;
    icon?: string;
    title?: string;
    actionName?: string;
    disabled?: boolean;
    separator?: boolean;
}

/**
 * Panels will have an ability to inject custom buttons into theirs panel header
 */
export interface IHeaderButton {
    displayOrder: number;
    icon: string;
    title: string;
    actionName: string;
    visible: boolean;
}

/**
 * Interface for method invoked when the user request to open a panel's context menu
 */
export interface IContextMenuAPI {
    getMenuItems(): IMenuItem[];
    appendMenuItem(item: IMenuItem): void;
    removeMenuItem(item: IMenuItem): void;
}


export interface IChannel {
    notify(eventName: string, payload?: any): void;
    subscribe(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI;
    subscribeOnce(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI;
    unsubscribeAll(eventName: string): void;
}

/**
 * Interface passed to the panel's factory method with the API to influence its state in runtime
 */
export interface IPanelStateAPI {
    getDockManager(): DockManager;

    enableProgressLoader(enable: boolean): void;
    activate(): void;

    setPanelIcon(html: string): void;
    setPanelFAIcon(faIcon: string): void;
    setPanelTitle(title: string): void;
    notifyHasChanges(hasChanges: boolean): void;

    channel(name?: string): IChannel;

    addHeaderButton(button: IHeaderButton): void;
    removeHeaderButton(actionName: string): void;
    showHeaderButton(actionName: string, flag: boolean): void;

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI;
}

export interface ITabbedPanelStateAPI extends IPanelStateAPI {
    setTabOrientation(orientation: TabOrientationType): void;
}

/**
 * This is interface implemented by a panel's factory method to query its state
 * The only required method is the factory method "initialize()" to create the panel's content
 */
export interface IGenericPanelAPI {

    getProgressLoader?: () => HTMLElement;

    canClose?: () => Promise<boolean>;
    onClose?: () => Promise<void>;

    getMinWidth?: () => number;
    getMinHeight?: () => number;
    onResize?: (width: number, height: number) => void;

    onQueryContextMenu?: (contextMenu: IContextMenuAPI) => void;

    loadState?: (state: IPanelState) => void;
    saveState?: (state: IPanelState) => void;

    onActionInvoked?: (actionName: string) => void;
}

export interface IPanelAPI extends IGenericPanelAPI {
    initialize: (api: IPanelStateAPI, options: IInitOptions) => Promise<HTMLElement>;
}

export interface ITabbedPanelAPI extends IGenericPanelAPI {
    initialize: (api: ITabbedPanelStateAPI, options: IInitOptions) => Promise<void>;

}
