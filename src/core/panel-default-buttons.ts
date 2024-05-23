import { IHeaderButton } from "../common/panel-api";

/**
 * Default Header Button Icons expressed as SVG
 * SVGs are taken from the free version of FontAwesone Library
 */

const CLOSE_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
`;

const MAXIMIZE_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"/></svg>
`;

const RESTORE_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/></svg>
`

const MINIMIZE_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/></svg>
`;

const EXPAND_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"/></svg>
`;

const COLLAPSE_BUTTON_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/></svg>
`;


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
    {
        displayOrder: 10000,
        icon:  CLOSE_BUTTON_ICON,
        title: "Close",
        actionName: PANEL_ACTION_CLOSE,
        visible: true
    },
    {
        displayOrder: 9000,
        icon: MAXIMIZE_BUTTON_ICON,
        title: "Maximize",
        actionName: PANEL_ACTION_MAXIMIZE,
        visible: true
    },
    {
        displayOrder: 8000,
        icon: RESTORE_BUTTON_ICON,
        title: "Restore",
        actionName: PANEL_ACTION_RESTORE,
        visible: true
    },
    {
        displayOrder: 7000,
        icon: MINIMIZE_BUTTON_ICON,
        title: "Minimize",
        actionName: PANEL_ACTION_MINIMIZE,
        visible: true
    },
    {
        displayOrder: 6000,
        icon: EXPAND_BUTTON_ICON,
        title: "Expand",
        actionName: PANEL_ACTION_EXPAND,
        visible: true
    },
    {
        displayOrder: 5000,
        icon: COLLAPSE_BUTTON_ICON,
        title: "Collapse",
        actionName: PANEL_ACTION_COLLAPSE,
        visible: true
    }
]
