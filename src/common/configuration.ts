
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    defaultPanelLabel?: string;
    defaultMinWidth?: number,
    defaultMinHeight?: number;
    zIndexes?: {
        zIndexCounter?: number;
        zIndexDialogCounter?: number;
        zIndexTabHost?: number;
        zIndexTabHandle?: number;
        zIndexWheel?: number;
        zIndexMaximizedPanel?: number;
        zIndexContextMenu?: number;
    }
}

export const DOCK_CONFIG_DEFAULTS: IDockConfig = {
    defaultPanelLabel: "Untitled",
    defaultMinWidth: 50,
    defaultMinHeight: 50,
    zIndexes: {
        zIndexCounter: 1001,
        zIndexDialogCounter: 10001,
        zIndexTabHost: 1000,
        zIndexTabHandle: 100,
        zIndexWheel: 1e6 - 1,
        zIndexMaximizedPanel: 1e6,
        zIndexContextMenu: 1e6 + 1
    }
}
