
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    enableLiveResize?: boolean;
    enableCollapsers?: boolean;
    collapserMarginSize?: number;
    collapserHorizontalSlidingRatio?: number;
    collapserVerticalSlidingRatio?: number;
    collapserMaxHorizontalNonSlidingDim?: number;
    collapserMaxVerticalNonSlidingDim?: number;

    defaultPanelSizeMagnitude?: number;
    minimumDefaultWidth?: number;
    minimumDefaultHeight?: number;
    minimizedWindowWidth?: number;
    minimizedWindowHeight?: number;
    dialogResizeHandleThickness?: number;
    dialogResizeHandleCornerSize?: number;
    sideWheelMargin?: number;
    tabStripScrollOffset?: number;
    defaultPanelLabel?: string;
    defaultMinWidth?: number,
    defaultMinHeight?: number;
    dragAndDropFrameRate?: number;
    popupWindows?: {
        minWindowWidth?: number,
        minWindowHeight?: number,
        maxWindowWidth?: number,
        maxWindowHeight?: number,
        windowOffsetX?: number,
        windowOffsetY?: number,
    },
    labels?: {
        collapseLabel?: string;
        expandLabel?: string;
        closeLabel?: string;
        closeAllLabel?: string;
        closeOthersLabel?: string;
        minimizeLabel?: string;
        maximizeLabel?: string;
        restoreLabel?: string;
        showInPopupLabel?: string;
        togglePinLabel?: string;
    },
    zIndexes?: {
        zIndexWheelItem?: number;
        zIndexCounter?: number;
        zIndexDialogCounter?: number;
        zIndexTabHost?: number;
        zIndexTabHandle?: number;
        zIndexWheel?: number;
        zIndexMaximizedPanel?: number;
        zIndexContextMenu?: number;
        zIndexDragAndDropBlocker?: number;
        zIndexTabReorderOperation?: number;
    }
}

export const DOCK_CONFIG_DEFAULTS: IDockConfig = {
    enableLiveResize: true,
    enableCollapsers: true,
    collapserMarginSize: 26,
    collapserHorizontalSlidingRatio: 0.3,
    collapserVerticalSlidingRatio: 0.4,
    collapserMaxHorizontalNonSlidingDim: 300,
    collapserMaxVerticalNonSlidingDim: 800,
    popupWindows: {
        minWindowWidth: 300,
        minWindowHeight: 200,
        maxWindowWidth: 800,
        maxWindowHeight: 550,
        windowOffsetX: 10,
        windowOffsetY: 10,
    },
    labels: {
        collapseLabel: "Collapse Panel",
        expandLabel: "Expand Panel",
        closeLabel: "Close Panel",
        closeAllLabel: "Close All",
        closeOthersLabel: "Close Others",
        minimizeLabel: "Minimize Panel",
        maximizeLabel: "Maximize Panel",
        restoreLabel: "Restore Panel",
        showInPopupLabel: "Show in Popup Window",
        togglePinLabel: "Pin / Unpin Panel"
    },
    minimumDefaultWidth: 400,
    minimumDefaultHeight: 200,
    defaultPanelSizeMagnitude: 1.5,
    minimizedWindowWidth: 250,
    minimizedWindowHeight: 24,
    dialogResizeHandleThickness: 10,    
    dialogResizeHandleCornerSize: 10,
    sideWheelMargin: 40,
    tabStripScrollOffset: 85,
    defaultPanelLabel: "Untitled",
    defaultMinWidth: 150,
    defaultMinHeight: 50,
    dragAndDropFrameRate: 120, 
    zIndexes: {
        zIndexCounter: 1001,
        zIndexDialogCounter: 10001,
        zIndexTabHost: 1000,
        zIndexTabHandle: 100,
        zIndexWheel: 1e6 - 1,
        zIndexWheelItem: 1e6 + 3,
        zIndexMaximizedPanel: 1e6,
        zIndexContextMenu: 1e6 + 1,
        zIndexDragAndDropBlocker: 1e6 + 2,
        zIndexTabReorderOperation: 1e6 - 1
    }
}
