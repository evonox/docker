import { IDockContainer } from "../common/declarations";
import { SelectionState, TabOrientation } from "../common/enumerations";
import { ITabbedPanelAPI } from "../common/panel-api";
import { DockManager } from "../facade/DockManager";
import { ComponentEventHandler, ComponentEventSubscription } from "../framework/component-events";
import { TabHost } from "../tabview/TabHost";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DOM } from "../utils/DOM";
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
    }

    removeContainer(container: PanelContainer) {
        ArrayUtils.removeItem(this.childContainers, container);
        this.tabHost.performLayout(this.childContainers, false);
        this.updateContainerState();
    }

    protected onInitialized(): void {
        super.onInitialized();
        this.tabHost = new TabHost(this.getDockManager(), TabOrientation.Left);
        // Note: We do not support Undock Behavior of contained Panel Containers for now
        this.tabHost.setEnableUndock(false);
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

    // on(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
    //     return this.tabHost.on(eventName, handler);
    // }

    // off(eventName: string): void {
    //     this.tabHost.off(eventName);
    // }

    // once(eventName: string, handler: ComponentEventHandler): ComponentEventSubscription {
    //     return this.tabHost.once(eventName, handler);
    // }

}
