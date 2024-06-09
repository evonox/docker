import { DockManager } from "../facade/DockManager";
import { PanelContainer } from "../containers/PanelContainer";
import { IPanelStateAPI, IHeaderButton, ISubscriptionAPI, IChannel } from "../common/panel-api";
import { DOM } from "../utils/DOM";
import { COG_LOADING_PROGRESS } from "../core/panel-default-buttons";

/**
 * Adapter object given the bridge between the outer panel state interface 
 * for the client view and the internal components of DockerTS Library
 */
export class PanelStateAdapter implements IPanelStateAPI {

    private domProgressLoader: HTMLElement;

    constructor(private panelContainer: PanelContainer) {}

    channel(name?: string): IChannel {
        return this.panelContainer.getDockManager().getChannel(name);
    }

    enableProgressLoader(enable: boolean): void {
        if(enable) {
            this.domProgressLoader = this.panelContainer.getAPI().getProgressLoader?.();
            // If the progress loader is not provided, use the default one
            if(this.domProgressLoader === undefined) {
                this.domProgressLoader = DOM.create("div")
                    .addClass("DockerTS-ProgressLoader")
                    .html(COG_LOADING_PROGRESS).get();
            }
            this.panelContainer.setContentElement(this.domProgressLoader);

        } else {
            // Remove the progress loader if present
            if(this.domProgressLoader !== undefined) {
                this.domProgressLoader.remove();
                this.domProgressLoader = undefined;
            }
        }
    }

    activate(): void {
        this.panelContainer.activatePanel();
    }

    getDockManager(): DockManager {
        return this.panelContainer.getDockManager();
    }

    setPanelIcon(html: string): void {
        this.panelContainer.setTitleIcon(html);
    }

    setPanelFAIcon(faIcon: string): void {
        this.setPanelIcon(`<i class="${faIcon}"></i>`);
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

    allowAction(actionName: string): void {
        this.panelContainer.allowAction(actionName);
    }

    denyAction(actionName: string): void {
        this.panelContainer.denyAction(actionName);
    }

    listenTo(eventName: string, handler: (payload?: any) => void): ISubscriptionAPI {
        return this.panelContainer.on(eventName, handler);
    }
}
