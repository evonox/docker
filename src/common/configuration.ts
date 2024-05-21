
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    defaultMinWidth?: number,
    defaultMinHeight?: number;
    zIndexes?: {
        zIndexCounter?: number;
        zIndexDialogCounter?: number;
        zIndexTabHost?: number;
        zIndexTabHandle?: number;
        zIndexWheel?: number;
    }
}

export const DOCK_CONFIG_DEFAULTS: IDockConfig = {
    defaultMinWidth: 50,
    defaultMinHeight: 50,
    zIndexes: {
        zIndexCounter: 1001,
        zIndexDialogCounter: 10001,
        zIndexTabHost: 1000,
        zIndexTabHandle: 100,
        zIndexWheel: 999999
    }
}
