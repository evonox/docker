import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { IDockContainer } from "../common/declarations";
import { SplitterPanel } from "./SplitterPanel";
import { IState } from "../common/serialization";
import { ContainerType, OrientationKind } from "../common/enumerations";
import { IContextMenuAPI } from "../common/panel-api";
import { IRect, ISize } from "../common/dimensions";

/**
 * This class is a pure adapter for the SplitterPanel to apply it easily to the docking facilities
 */
export abstract class SplitterDockContainer implements IDockContainer {

    private splitterPanel: SplitterPanel;

    private loadedSize: ISize;

    constructor(private childContainers: IDockContainer[], private orientation: OrientationKind) {
        this.splitterPanel = new SplitterPanel(this.childContainers, this.orientation);
    }

    handleContextMenuAction(actionName: string): void {}

    updateContainerState(): void {
        this.splitterPanel.updateContainerState();
    }

    updateLayoutState(): void {
        this.splitterPanel.updateLayoutState();
    }

    isHidden(): boolean {
        return false;
    }

    setHeaderVisibility(visible: boolean): void {}

    queryLoadedSize(): ISize {
        return {...this.loadedSize};
    }
    
    onQueryContextMenu(config: IContextMenuAPI): void {}

    getMinimumChildNodeCount(): number {
        return 2;
    }

    setActiveChild(container: IDockContainer): void {}

    saveState(state: IState): void {
        state.width = this.getWidth();
        state.height = this.getHeight();
    }

    loadState(state: IState): void {
        this.loadedSize = { w: state.width, h: state.height };
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean)  {
        this.childContainers = children;
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

    resize(rect: IRect): void {
        this.splitterPanel.resize(rect);
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
        if(this.orientation === OrientationKind.Row) {
            return this.childContainers.reduce((prev, value) => {
                return prev + value.getMinWidth();
            }, 0) + this.splitterPanel.getTotalBarSize();
        } else {
            return this.childContainers.reduce((prev, value) => {
                return Math.max(prev, value.getMinWidth());
            }, 0);
        }
    }

    getMinHeight(): number {
        if(this.orientation === OrientationKind.Row) {
            return this.childContainers.reduce((prev, value) => {
                return Math.max(prev, value.getMinHeight());
            }, 0);
        } else {
            return this.childContainers.reduce((prev, value) => {
                return prev + value.getMinHeight();
            }, 0) + this.splitterPanel.getTotalBarSize();
        }
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
