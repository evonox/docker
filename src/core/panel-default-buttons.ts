import { IHeaderButton } from "../common/panel-api";

/**
 * Configuration of default panel buttons
 */

export const PANEL_ACTION_EXPAND = "onExpand";
export const PANEL_ACTION_COLLAPSE = "onCollapse";
export const PANEL_ACTION_MINIMIZE = "onMinimize";
export const PANEL_ACTION_RESTORE = "onRestore";
export const PANEL_ACTION_MAXIMIZE = "onMaximize";
export const PANEL_ACTION_CLOSE = "onClose";

const PANEL_DEFAULT_ACTION_LIST = [
    PANEL_ACTION_CLOSE, 
    PANEL_ACTION_COLLAPSE, 
    PANEL_ACTION_EXPAND, 
    PANEL_ACTION_MAXIMIZE,
    PANEL_ACTION_MINIMIZE,
    PANEL_ACTION_RESTORE
];

export function isPanelDefaultAction(actionName: string) {
    return PANEL_DEFAULT_ACTION_LIST.includes(actionName);
}

export const PANEL_DEFAULT_BUTTONS: IHeaderButton[] = [


]
