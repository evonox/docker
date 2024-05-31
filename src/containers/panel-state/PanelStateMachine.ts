import { PanelContainerState } from "../../common/enumerations";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { PanelContainer } from "../PanelContainer";
import { DockedState } from "./DockedState";
import { FloatingState } from "./FloatingState";
import { IGenericPanelState, IPanelStateAPI } from "./IPanelState";
import { MaximizedState } from "./MaximizedState";
import { MinimizedState } from "./MinimizedState";
import { SharedStateConfig } from "./SharedStateConfig";

/**
 * Facade Class - generic state machine class for a panel container
 */
export class PanelStateMachine implements IPanelStateAPI {

    private currentState: IGenericPanelState;
    private config = new SharedStateConfig();
    
    private containerState: PanelContainerState;

    private dialog?: Dialog;

    constructor(
        private dockManager: DockManager, 
        private panel: PanelContainer,
        initialState: PanelContainerState
    ) {
        this.containerState = initialState;
        this.currentState = this.createStateByType(initialState);
        this.currentState.enterState();
    }

    getCurrentState(): PanelContainerState {
        return this.containerState;
    }

    // Cleanup Method
    dispose(): void {
        this.currentState.dispose();
        this.panel = undefined;
        this.currentState = undefined;
        this.dockManager = undefined;
    }

    /**
     * State Transition Methods
     */
    async dockPanel(): Promise<boolean> {
        const isAllowed = await this.currentState.dockPanel();
        if(isAllowed) {
            delete this.dialog;
            this.changeStateTo(PanelContainerState.Docked);
        }
        return isAllowed;
    }

    async floatPanel(dialog: Dialog): Promise<boolean> {
        const isAllowed = await this.currentState.floatPanel(dialog);
        if(isAllowed) {
            this.dialog = dialog;
            this.changeStateTo(PanelContainerState.Floating);
        }
        return isAllowed;
    }

    async minimize(): Promise<boolean> {
        const isAllowed = await this.currentState.minimize();
        if(isAllowed) {
            delete this.dialog;
            this.changeStateTo(PanelContainerState.Minimized);           
        }
        return isAllowed;
    }

    async maximize(): Promise<boolean> {
        const isAllowed = await this.currentState.maximize();
        if(isAllowed) {
            delete this.dialog;
            this.changeStateTo(PanelContainerState.Maximized);
        }
        return isAllowed;
    }

    async restore(): Promise<boolean> {
        const isAllowed = await this.currentState.restore();
        if(isAllowed) {
            this.changeStateTo(this.config.get("restoreState", PanelContainerState.Docked));
        }
        return isAllowed;
    }

    // Misc State Change Methods
    async collapse(): Promise<boolean> {
        return await this.currentState.collapse();
    }

    async expand(): Promise<boolean> {
        return await this.currentState.expand();
    }

    updatePanelState(): void {
        this.currentState.updatePanelState();
    }

    updateLayoutState(): void {
        this.currentState.updateLayoutState();
    }

    // Generic private method to change state
    private changeStateTo(state: PanelContainerState) {
        this.currentState.leaveState();
        this.containerState = state;
        this.currentState = this.createStateByType(state);
        this.currentState.enterState();
    }

    // State factory method
    private createStateByType(state: PanelContainerState): IGenericPanelState {
        switch(state) {
            case PanelContainerState.Docked: return new DockedState(this.dockManager, this.panel, this.config);
            case PanelContainerState.Floating: return new FloatingState(this.dockManager, this.panel, this.config, this.dialog);
            case PanelContainerState.Maximized: return new MaximizedState(this.dockManager, this.panel, this.config);
            case PanelContainerState.Minimized: return new MinimizedState(this.dockManager, this.panel, this.config);
            default: throw new Error(`Unknown Panel State ${state}`);
        }
    }
}
