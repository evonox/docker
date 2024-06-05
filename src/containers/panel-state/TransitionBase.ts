import { DockManager } from "../../facade/DockManager";
import { PanelContainer } from "../PanelContainer";
import { SharedStateConfig } from "./SharedStateConfig";

/**
 * State Transition Base Class
 */
export abstract class TransitionBase {

    constructor(
        protected dockManager: DockManager, 
        protected panel: PanelContainer, 
        protected config: SharedStateConfig
    ) {}

    abstract trigger(): Promise<void>;
}
