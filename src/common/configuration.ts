
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    tabStripScrollOffset?: number;
    defaultPanelLabel?: string;
    defaultMinWidth?: number,
    defaultMinHeight?: number;
    dragAndDropFrameRate?: number;
    zIndexes?: {
        zIndexCounter?: number;
        zIndexDialogCounter?: number;
        zIndexTabHost?: number;
        zIndexTabHandle?: number;
        zIndexWheel?: number;
        zIndexMaximizedPanel?: number;
        zIndexContextMenu?: number;
        zIndexDragAndDropBlocker?: number;
    }
}

export const DOCK_CONFIG_DEFAULTS: IDockConfig = {
    tabStripScrollOffset: 85,
    defaultPanelLabel: "Untitled",
    defaultMinWidth: 50,
    defaultMinHeight: 50,
    dragAndDropFrameRate: 120, 
    zIndexes: {
        zIndexCounter: 1001,
        zIndexDialogCounter: 10001,
        zIndexTabHost: 1000,
        zIndexTabHandle: 100,
        zIndexWheel: 1e6 - 1,
        zIndexMaximizedPanel: 1e6,
        zIndexContextMenu: 1e6 + 1,
        zIndexDragAndDropBlocker: 1e6 + 2
    }
}
