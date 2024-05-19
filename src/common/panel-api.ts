import { DockManager } from "../DockManager";

export interface IInitOptions {
    getValue(key: string, defaultValue?: any): any;
}

export interface ISubscriptionAPI {
    unsubscribe(): void;
}

export interface IPanelState {
    getValue(key: string, defaultValue?: any): any;
    setValue(key: string, value: any): void;
}

export interface IMenuItem {
    displayOrder: number;
    icon?: string;
    title?: string;
    actionName?: string;
    disabled?: boolean;
    separator?: boolean;
}

export interface IHeaderButton {
    displayOrder: number;
    icon: string;
    title: string;
    actionName: string;
    visible: boolean;
}

export interface IContextMenuAPI {
    getMenuItems(): IMenuItem[];
    appendMenuItem(item: IMenuItem): void;
    removeMenuItem(item: IMenuItem): void;
}

export interface IDockManagerAPI {
    getDockManager(): DockManager;

    setPanelIcon(html: string): void;
    setPanelTitle(title: string): void;
    notifyHasChanges(hasChanges: boolean): void;

    addHeaderButton(button: IHeaderButton): void;
    removeHeaderButton(actionName: string): void;
    showHeaderButton(actionName: string, flag: boolean): void;

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI;
}


export interface IPanelAPI {
    initialize: (api: IDockManagerAPI, options: IInitOptions) => Promise<HTMLElement>;

    canClose?: () => boolean;

    getMinWidth?: () => number;
    getMinHeight?: () => number;

    onQueryContextMenu?: (contextMenu: IContextMenuAPI) => void;

    loadState?: (state: IPanelState) => void;
    saveState?: (state: IPanelState) => void;

    onActionInvoked?: (actionName: string) => void;
}
