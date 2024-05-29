
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    dialogResizeHandleThickness?: number;
    dialogResizeHandleCornerSize?: number;
    sideWheelMargin?: number;
    tabStripScrollOffset?: number;
    defaultPanelLabel?: string;
    defaultMinWidth?: number,
    defaultMinHeight?: number;
    dragAndDropFrameRate?: number;
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
