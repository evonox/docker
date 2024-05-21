import { DockManager } from "../facade/DockManager";
import { PanelContainer } from "../containers/PanelContainer";
import { IPanelStateAPI, IHeaderButton, ISubscriptionAPI } from "../common/panel-api";

/**
 * Adapter object given the bridge between the outer panel state interface 
 * for the client view and the internal components of DockerTS Library
 */
export class PanelStateAdapter implements IPanelStateAPI {

    constructor(private panelContainer: PanelContainer) {}

    activate(): void {
        this.panelContainer.activatePanel();
    }

    getDockManager(): DockManager {
        return this.panelContainer.getDockManager();
    }

    setPanelIcon(html: string): void {
        this.panelContainer.setTitleIcon(html);
    }

    setPanelTitle(title: string): void {
        this.panelContainer.setTitle(title);
    }

    notifyHasChanges(hasChanges: boolean): void {
        this.panelContainer.setHasChanges(hasChanges);
    }

    addHeaderButton(button: IHeaderButton): void {
        this.panelContainer.addHeaderButton(button);
    }

    removeHeaderButton(actionName: string): void {
        this.panelContainer.removeHeaderButton(actionName);
    }

    showHeaderButton(actionName: string, isVisible: boolean): void {
        this.panelContainer.showHeaderButton(actionName, isVisible);
    }

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI {
        return this.panelContainer.on(eventName, handler);
    }
}
