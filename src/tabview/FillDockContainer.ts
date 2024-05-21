import { DockManager } from "../facade/DockManager";
import {  IDockContainer } from "../common/declarations";
import { IState } from "../common/serialization";
import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { ContainerType } from "../common/enumerations";
import { IContextMenuAPI } from "../common/panel-api";
import { DOM } from "../utils/DOM";


/**
 * Decorator over TabHost
 */
export class FillDockContainer implements IDockContainer {

    private domContainer: DOM<HTMLElement>;

    constructor(private dockManager: DockManager) {
        this.domContainer = DOM.create("div");
    }

    onQueryContextMenu(config: IContextMenuAPI): void {
        throw new Error("Method not implemented.");
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    getDOM(): HTMLElement {
        return this.domContainer.get();
    }

    hasChanges(): boolean {
        throw new Error("Method not implemented.");
    }
    getMinimumChildNodeCount(): number {
        throw new Error("Method not implemented.");
    }
    setActiveChild(container: IDockContainer): void {
        throw new Error("Method not implemented.");
    }
    setVisible(visible: boolean): void {
        throw new Error("Method not implemented.");
    }
    getMinWidth(): number {
        throw new Error("Method not implemented.");
    }
    getMinHeight(): number {
        throw new Error("Method not implemented.");
    }
    getWidth(): number {
        throw new Error("Method not implemented.");
    }
    getHeight(): number {
        throw new Error("Method not implemented.");
    }
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
    }
    resize(width: number, height: number): void {
    }
    getContainerType(): ContainerType {
        return ContainerType.FillLayout;
    }
    saveState(state: IState): void {
        throw new Error("Method not implemented.");
    }
    loadState(state: IState): void {
        throw new Error("Method not implemented.");
    }
    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        throw new Error("Method not implemented.");
    }
    off(eventName: string): void {
        throw new Error("Method not implemented.");
    }
    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        throw new Error("Method not implemented.");
    }

}
