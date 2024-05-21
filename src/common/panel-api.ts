import type { DockManager } from "../facade/DockManager";

/**
 * Panel API Enumerations
 */

export type ViewInstanceType = "singleton" | "transient";

export type ViewKind = "document" | "panel" ;

export interface PanelFactoryFunction {
    (dockManager: DockManager): IPanelAPI;
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

/**
 * Interface passed to the panel's factory method with the API to influence its state in runtime
 */
export interface IPanelStateAPI {
    getDockManager(): DockManager;

    activate(): void;

    setPanelIcon(html: string): void;
    setPanelTitle(title: string): void;
    notifyHasChanges(hasChanges: boolean): void;

    addHeaderButton(button: IHeaderButton): void;
    removeHeaderButton(actionName: string): void;
    showHeaderButton(actionName: string, flag: boolean): void;

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI;
}

/**
 * This is interface implemented by a panel's factory method to query its state
 * The only required method is the factory method "initialize()" to create the panel's content
 */
export interface IPanelAPI {
    initialize: (api: IPanelStateAPI, options: IInitOptions) => Promise<HTMLElement>;

    canClose?: () => boolean;
    onClose?: () => void;

    getMinWidth?: () => number;
    getMinHeight?: () => number;

    onQueryContextMenu?: (contextMenu: IContextMenuAPI) => void;

    loadState?: (state: IPanelState) => void;
    saveState?: (state: IPanelState) => void;

    onActionInvoked?: (actionName: string) => void;
}
