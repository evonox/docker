import { DockManager } from "../facade/DockManager";
import {  IDockContainer } from "../common/declarations";
import { IState } from "../common/serialization";
import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { ContainerType, TabOrientation } from "../common/enumerations";
import { IContextMenuAPI } from "../common/panel-api";
import { DOM } from "../utils/DOM";
import { IRect, ISize } from "../common/dimensions";
import { TabHost } from "../tabview/TabHost";

import "./FillDockContainer.css";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";

/**
 * Decorator over TabHost
 */
export class FillDockContainer implements IDockContainer {

    private domContainer: DOM<HTMLElement>;
    protected tabHost: TabHost;
    private _loadedSize: ISize;
    private childContainers: IDockContainer[] = [];

    constructor(protected dockManager: DockManager, private tabStripDirection: TabOrientation) {
        this.domContainer = DOM.create("div").addClass("DockerTS-FillDockContainer").cacheBounds(false);
        this.tabHost = new TabHost(this.dockManager, this.tabStripDirection);
        this.domContainer.appendChild(this.tabHost.getDOM());
    }

    handleContextMenuAction(actionName: string): void {}

    updateState(): void {
        this.tabHost.updateContainerState();
        this.tabHost.updateLayoutState();
    }

    updateLayout(rect?: IRect): void {
        this.tabHost.resize(rect);
    }

    setHeaderVisibility(visible: boolean): void {}

    isHidden(): boolean {
        return false;
    }

    queryLoadedSize(): ISize {
        return {...this._loadedSize};
    }

    onQueryContextMenu(config: IContextMenuAPI): void {}

    dispose(): void {
        this.tabHost.dispose();
        this.domContainer.removeFromDOM();
    }

    getDOM(): HTMLElement {
        return this.domContainer.get();
    }

    hasChanges(): boolean {
        return false;
    }

    getMinimumChildNodeCount(): number {
        return 2;
    }    

    setActiveChild(container: IDockContainer): void {
        this.tabHost.focusActiveTab(container);
    }

    setVisible(visible: boolean): void {}

    getMinWidth(): number {
        return this.tabHost.getMinWidth();
    }

    getMinHeight(): number {
        return this.tabHost.getMinHeight();
    }

    getWidth(): number {
        return this.domContainer.getWidth();
    }

    getHeight(): number {
        return this.domContainer.getHeight();
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        this.childContainers = children;
        this.tabHost.performLayout(children, relayoutEvenIfEqual);
    }

    getChildContainers(): IDockContainer[] {
        return [...this.childContainers];
    }

    resize(rect: IRect): void {
        this.tabHost.resize(rect);
    }

    getContainerType(): ContainerType {
        return ContainerType.FillLayout;
    }

    saveState(state: IState): void {
        state.width = this.getWidth();
        state.height = this.getHeight();
    }

    loadState(state: IState): void {
        this._loadedSize = {w: state.width, h: state.height};
    }

    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.tabHost.on(eventName, handler);
    }

    off(eventName: string): void {
        this.tabHost.off(eventName);
    }

    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.tabHost.once(eventName, handler);
    }
}
