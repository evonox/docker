import { PanelContainerState } from "../../common/enumerations";
import { DockManager } from "../../facade/DockManager";
import { PanelContainer } from "../PanelContainer";
import { SharedStateConfig } from "./SharedStateConfig";
import { TransitionBase } from "./TransitionBase";
import { MaximizeAnimationTransition, MinimizeAnimationTransition, NoActionTransition, RestoreAnimationTransition } from "./state-transitions";

/**
 * State Transition Constructor Function Type
 */
interface TransitionCtor {
    new(dockManager: DockManager, panel: PanelContainer, config: SharedStateConfig): TransitionBase;
}

/**
 * State Transition Definition Type
 */
interface TransitionDefinition {
    fromState: PanelContainerState,
    toState: PanelContainerState,
    transitionCtor: TransitionCtor;
}

/**
 * Definitions of state transitions
 */
const STATE_TRANSITIONS: TransitionDefinition[] = [
    {
        fromState: PanelContainerState.Minimized, toState: PanelContainerState.Maximized, 
        transitionCtor: MaximizeAnimationTransition
    },
    {
        fromState: PanelContainerState.Minimized, toState: PanelContainerState.Floating,
        transitionCtor: RestoreAnimationTransition
    },
    {
        fromState: PanelContainerState.Maximized, toState: PanelContainerState.Minimized,
        transitionCtor: MinimizeAnimationTransition
    },
    { 
        fromState: PanelContainerState.Maximized, toState: PanelContainerState.Docked,
        transitionCtor: RestoreAnimationTransition
    },
    {
        fromState: PanelContainerState.Maximized, toState: PanelContainerState.Floating,
        transitionCtor: RestoreAnimationTransition
    },
    {
        fromState: PanelContainerState.Docked, toState: PanelContainerState.Maximized,
        transitionCtor: MaximizeAnimationTransition
    },
    {
        fromState: PanelContainerState.Floating, toState: PanelContainerState.Maximized,
        transitionCtor: MaximizeAnimationTransition
    },
    {
        fromState: PanelContainerState.Floating, toState: PanelContainerState.Minimized,
        transitionCtor: MinimizeAnimationTransition
    },
    {
        fromState: PanelContainerState.Docked, toState: PanelContainerState.Floating,
        transitionCtor: NoActionTransition
    },
    {
        fromState: PanelContainerState.Floating, toState: PanelContainerState.Docked,
        transitionCtor: NoActionTransition
    },
    {
        fromState: PanelContainerState.Docked, toState: PanelContainerState.PopupWindow,
        transitionCtor: NoActionTransition
    },
    {
        fromState: PanelContainerState.PopupWindow, toState: PanelContainerState.Docked,
        transitionCtor: NoActionTransition
    },
    {
        fromState: PanelContainerState.Docked, toState: PanelContainerState.InCollapser,
        transitionCtor: NoActionTransition
    },
    {
        fromState: PanelContainerState.InCollapser, toState: PanelContainerState.Docked,
        transitionCtor: NoActionTransition
    }
];

/**
 * Factory class for state transitions
 */
export class StateTransitionFactory {

    public static create(
        dockManager: DockManager, 
        panel: PanelContainer, 
        config: SharedStateConfig,
        fromState: PanelContainerState, 
        toState: PanelContainerState): TransitionBase {
        
        const transitionCtor = this.lookupTransition(fromState, toState);
        return new transitionCtor(dockManager, panel, config);
    }

    private static lookupTransition(
        fromState: PanelContainerState, 
        toState: PanelContainerState
    ): TransitionCtor {
        const definition = STATE_TRANSITIONS
            .find(def => def.fromState === fromState && def.toState === toState);
        if(definition === undefined)
            throw new Error(`Transition from state ${fromState} to state ${toState} was not found.`);
        return definition.transitionCtor;
    }
}
