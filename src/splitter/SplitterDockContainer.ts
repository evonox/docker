import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { IDockContainer } from "../common/declarations";
import { SplitterPanel } from "./SplitterPanel";
import { IState } from "../common/serialization";
import { ContainerType, OrientationKind } from "../common/enumerations";
import { IContextMenuAPI } from "../common/panel-api";

/**
 * This class is a pure adapter for the SplitterPanel to apply it easily to the docking facilities
 */
export abstract class SplitterDockContainer implements IDockContainer {

    private splitterPanel: SplitterPanel;

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        this.splitterPanel = new SplitterPanel(this.childContainers, this.orientation);
    }
    onQueryContextMenu(config: IContextMenuAPI): void {
        throw new Error("Method not implemented.");
    }
    getMinimumChildNodeCount(): number {
        throw new Error("Method not implemented.");
    }
    setActiveChild(container: IDockContainer): void {
        //throw new Error("Method not implemented.");
    }
    saveState(state: IState): void {
        throw new Error("Method not implemented.");
    }
    loadState(state: IState): void {
        throw new Error("Method not implemented.");
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean = false)  {
        this.splitterPanel.performLayout(children, relayoutEvenIfEqual);
    }

    setContainerRatio(container: IDockContainer, ratio: number) {
        this.splitterPanel.setContainerRatio(container, ratio);
    }

    getRatios(): number[] {
        return this.splitterPanel.getRatios();
    }

    setRatios(ratios: number[]) {
        this.splitterPanel.setRatios(ratios);
    }

    resize(width: number, height: number): void {
        this.splitterPanel.resize(width, height);
    }

    dispose() {
        this.splitterPanel.dispose();
    }

    getDOM(): HTMLElement {
        return this.splitterPanel.getDOM();
    }

    on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.splitterPanel.on(eventName, handler);
    }

    off(eventName: string): void {
        this.splitterPanel.off(eventName);
    }

    once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
        return this.splitterPanel.once(eventName, handler);
    }

    // Note: This flag applies only to the PanelContainer
    hasChanges(): boolean {
        return false;
    }

    // Note: This method applies just to the PanelContainer - empty implementation
    setVisible(visible: boolean): void {}

    getMinWidth(): number {
        let minWidth = 0;
        for(const container of this.childContainers) {
            minWidth += container.getMinWidth();            
        }
        return minWidth;
    }

    getMinHeight(): number {
        let minHeight = 0;
        for(const container of this.childContainers) {
            minHeight += container.getMinHeight();            
        }
        return minHeight;
    }

    getWidth(): number {
        return this.splitterPanel.getDOM().clientWidth;
    }

    getHeight(): number {
        return this.splitterPanel.getDOM().clientHeight;
    }

    getContainerType(): ContainerType {
        return this.orientation === OrientationKind.Row ? ContainerType.RowLayout : ContainerType.ColumnLayout;
    }
}
