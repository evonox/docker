import type { IRect } from "../../common/dimensions";
import type { Dialog } from "../../floating/Dialog";

/**
 * Generic panel state API interface
 */
export interface IPanelStateAPI {
    // Clenaup when the panel is closed / destroyed
    dispose(): void;

    // State Transition Methods - return true if the state transition is allowed
    dockPanel(dockingFn?: () => void): Promise<boolean>;
    floatPanel(dialog: Dialog): Promise<boolean>;

    minimize(): Promise<boolean>;
    maximize(): Promise<boolean>;
    restore(): Promise<boolean>;
    collapse(): Promise<boolean>;
    expand(): Promise<boolean>;

    showPopup(): Promise<boolean>;
    hidePopup(): Promise<boolean>;

    pinPanel(): Promise<boolean>;
    unpinPanel(): Promise<boolean>;

    // Central update methods
    updateState(): void;
    updateLayout(rect?: IRect): void;
}

/**
 * Generic panel state interface
 */
export interface IGenericPanelState extends IPanelStateAPI {
    // Enter / Leave State methods for initialization and clenaup
    enterState(initialState: boolean): Promise<void>;
    leaveState(): Promise<void>;
}