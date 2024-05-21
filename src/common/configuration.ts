
/**
 * DockerTS Library Configuration
 */

export interface IDockConfig {
    zIndexes?: {
        zIndexCounter?: number;
        zIndexDialogCounter?: number;
        zIndexTabHost?: number;
        zIndexTabHandle?: number;
        zIndexWheel?: number;
    }
}

export const DOCK_CONFIG_DEFAULTS: IDockConfig = {
    zIndexes: {
        zIndexCounter: 1001,
        zIndexDialogCounter: 10001,
        zIndexTabHost: 1000,
        zIndexTabHandle: 100,
        zIndexWheel: 999999
    }
}
