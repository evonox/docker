import { DockManager } from "../DockManager";
import { ContainerType, IDockContainer } from "../common/declarations";
import { IState } from "../common/serialization";
import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";


/**
 * Decorator over TabHost
 */
export class FillDockContainer implements IDockContainer {

    constructor(private dockManager: DockManager) {}
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    getDOM(): HTMLElement {
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    }
    resize(width: number, height: number): void {
        throw new Error("Method not implemented.");
    }
    getContainerType(): ContainerType {
        throw new Error("Method not implemented.");
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
