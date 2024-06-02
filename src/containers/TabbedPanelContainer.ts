import { IDockContainer } from "../common/declarations";
import { IRect } from "../common/dimensions";
import { PanelContainerState, SelectionState, TabOrientation } from "../common/enumerations";
import { ITabbedPanelAPI } from "../common/panel-api";
import { DockManager } from "../facade/DockManager";
import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { TabHost } from "../tabview/TabHost";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DOM } from "../utils/DOM";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";
import { RectHelper } from "../utils/rect-helper";
import { PanelContainer } from "./PanelContainer";


export class TabbedPanelContainer extends PanelContainer {

    private childContainers: PanelContainer[] = [];
    private tabHost: TabHost;
    
    constructor(
        dockManager: DockManager, 
        panelTypeName: string,
        private tabbedApi: ITabbedPanelAPI
    ) 
    {
        super(dockManager, panelTypeName, tabbedApi);
    }

    setTabOrientation(orientation: TabOrientation) {
        this.tabHost.setTabOrientation(orientation);
    }

    addContainer(container: PanelContainer) {
        this.getDockManager().getContainerElement().appendChild(container.getContentFrameDOM().get());
        this.childContainers.push(container);
        this.tabHost.performLayout(this.childContainers, false);
        this.updateContainerState();

        // Redirecting the onFocused event
        container.on("onFocused", () => {
            this.triggerEvent("onFocused");
        });
    }

    removeContainer(container: PanelContainer) {
        // Clear all binded events
        container.off("onFocused");
        ArrayUtils.removeItem(this.childContainers, container);
        this.tabHost.performLayout(this.childContainers, false);
        this.updateContainerState();
    }

    setVisible(visible: boolean): void {
        super.setVisible(visible);
        if(visible === false) {
            this.childContainers.forEach(container => container.setVisible(false));
        } else {
            this.tabHost.getSelectedTab().getContainer().setVisible(true);
        }
    }

    protected onInitialized(): void {
        super.onInitialized();
        this.tabHost = new TabHost(this.getDockManager(), TabOrientation.Left);
        // Note: We do not support Undock & Maximization Behavior of contained Panel Containers for now
        this.tabHost.setEnableUndock(false);
        this.tabHost.setEnableMaximization(false);
    }

    protected onInitialRender(): HTMLElement {
        const result = super.onInitialRender();
        const domTabHost = this.tabHost.getDOM();
        DOM.from(domTabHost).height("100%");
        this.setContentElement(domTabHost);
        return result;
    }

    protected onDisposed(): void {
        super.onDisposed();
        this.tabHost.dispose();
    }

    updateContainerState(): void {
        super.updateContainerState();
        this.tabHost.updateContainerState();
        this.updateLayoutState();
        this.overrideFocusedState();
    }

    updateLayoutState(): void {
        super.updateLayoutState();
        this.tabHost.updateLayoutState();
        let zIndex = this.getContentFrameDOM().getZIndex();
        if(isNaN(zIndex)) {
            zIndex = 1;
        }
        this.childContainers?.forEach(child => {
            child.getContentFrameDOM().zIndex(zIndex + 1)
        });
    }

    resize(rect: IRect): void {
        if(this.state.getCurrentState() === PanelContainerState.Maximized) {
            rect = RectHelper.fromDOMRect(this.dockManager.getContainerBoundingRect());
        }
        super.resize(rect);
        this.updateContainerState();
        this.updateLayoutState();
    }

    private overrideFocusedState() {
        const isTabHandleFocused = this.tabHost.getSelectedTab()?.getSelectionState() === SelectionState.Focused;
        const domFrameHeader = this.getFrameHeaderDOM();
        if(this.dockManager.getActivePanel() === this || isTabHandleFocused) {
            domFrameHeader.addClass("DockerTS-FrameHeader--Selected");
            this.tabHost.getSelectedTab()?.setSelectionState(SelectionState.Focused);
            // TODO: Note - causes recursive calls - need to find a different solution
            // this.triggerEvent("onFocused");
        } else {
            domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }
    }

    setActiveChild(container: IDockContainer): void {
        this.updateContainerState();
        this.updateLayoutState();
        this.tabHost.focusActiveTab(container);
    }    

    getMinWidth(): number {
        return this.tabHost.getMinWidth();
    }

    getMinHeight(): number {
        return this.tabHost.getMinHeight();
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        this.tabHost.performLayout(this.childContainers, relayoutEvenIfEqual);
    }
}
