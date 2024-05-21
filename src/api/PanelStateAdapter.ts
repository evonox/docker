import { DockManager } from "../facade/DockManager";
import { PanelContainer } from "../containers/PanelContainer";
import { IPanelStateAPI, IHeaderButton, ISubscriptionAPI } from "../common/panel-api";


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
        throw new Error("Method not implemented.");
    }

    removeHeaderButton(actionName: string): void {
        throw new Error("Method not implemented.");
    }

    showHeaderButton(actionName: string, flag: boolean): void {
        throw new Error("Method not implemented.");
    }

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI {
        return this.panelContainer.on(eventName, handler);
    }
}
