import { PanelContainerState } from "../../common/enumerations";
import { DockManager } from "../../facade/DockManager";
import { Dialog } from "../../floating/Dialog";
import { PanelContainer } from "../PanelContainer";
import { DockedState } from "./DockedState";
import { FloatingState } from "./FloatingState";
import { IGenericPanelState, IPanelStateAPI } from "./IPanelState";
import { InCollapserState } from "./InCollapserState";
import { MaximizedState } from "./MaximizedState";
import { MinimizedState } from "./MinimizedState";
import { PopupWindowState } from "./PopupWindowState";
import { SharedStateConfig } from "./SharedStateConfig";
import { StateTransitionFactory } from "./StateTransitionFactory";

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
        this.currentState.enterState(true);
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
            await this.changeStateTo(PanelContainerState.Docked);
        }
        return isAllowed;
    }

    async floatPanel(dialog: Dialog): Promise<boolean> {
        const isAllowed = await this.currentState.floatPanel(dialog);
        if(isAllowed) {
            this.dialog = dialog;
            await this.changeStateTo(PanelContainerState.Floating);
        }
        return isAllowed;
    }

    async minimize(): Promise<boolean> {
        const isAllowed = await this.currentState.minimize();
        if(isAllowed) {
            delete this.dialog;
            await this.changeStateTo(PanelContainerState.Minimized);           
        }
        return isAllowed;
    }

    async maximize(): Promise<boolean> {
        const isAllowed = await this.currentState.maximize();
        if(isAllowed) {
            delete this.dialog;
            await this.changeStateTo(PanelContainerState.Maximized);
        }
        return isAllowed;
    }

    async restore(): Promise<boolean> {
        const isAllowed = await this.currentState.restore();
        if(isAllowed) {
            await this.changeStateTo(this.config.get("restoreState", PanelContainerState.Docked));
        }
        return isAllowed;
    }

    async showPopup(): Promise<boolean> {
        const isAllowed = await this.currentState.showPopup();
        if(isAllowed) {
            await this.changeStateTo(PanelContainerState.PopupWindow);
        }
        return isAllowed;
    }

    async hidePopup(): Promise<boolean> {
        const isAllowed = await this.currentState.hidePopup();
        if(isAllowed) {
            await this.changeStateTo(this.config.get("restoreState", PanelContainerState.Docked));
        }
        return isAllowed;
    }

    async pinPanel(): Promise<boolean> {
        const isAllowed = await this.currentState.pinPanel();
        if(isAllowed) {
            await this.changeStateTo(PanelContainerState.Docked);
        }
        return isAllowed;              
    }

    async unpinPanel(): Promise<boolean> {
        const isAllowed = await this.currentState.unpinPanel();
        if(isAllowed) {
            await this.changeStateTo(PanelContainerState.InCollapser);
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

    updateState(): void {
        // Note: Current State may be undefined when triggered from the transition class
        this.currentState?.updateState();
    }

    // Generic private method to change state
    private async changeStateTo(newState: PanelContainerState): Promise<void> {
        // Leave the state
        await this.currentState.leaveState(); 
        // No state set during transition operation due to the calls of 'update' function
        this.currentState = undefined; 

        // Trigger the state transition
        const transition = StateTransitionFactory.create(this.dockManager, this.panel, this.config, 
                this.containerState, newState);
        await transition.trigger();

        // Create and enter the new state
        this.containerState = newState;
        this.currentState = this.createStateByType(newState);       
        
        await this.currentState.enterState(false);
    }

    // State factory method
    private createStateByType(state: PanelContainerState): IGenericPanelState {
        switch(state) {
            case PanelContainerState.Docked: return new DockedState(this.dockManager, this.panel, this.config);
            case PanelContainerState.Floating: return new FloatingState(this.dockManager, this.panel, this.config, this.dialog);
            case PanelContainerState.Maximized: return new MaximizedState(this.dockManager, this.panel, this.config);
            case PanelContainerState.Minimized: return new MinimizedState(this.dockManager, this.panel, this.config);
            case PanelContainerState.PopupWindow: return new PopupWindowState(this.dockManager, this.panel, this.config);
            case PanelContainerState.InCollapser: return new InCollapserState(this.dockManager, this.panel, this.config);
            default: throw new Error(`Unknown Panel State ${state}`);
        }
    }
}
