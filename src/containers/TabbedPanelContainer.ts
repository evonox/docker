import { IDockContainer } from "../common/declarations";
import { IRect } from "../common/dimensions";
import { SelectionState, TabOrientation } from "../common/enumerations";
import { ITabbedPanelAPI } from "../common/panel-api";
import { DockManager } from "../facade/DockManager";
import { TabHost } from "../tabview/TabHost";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DOM } from "../utils/DOM";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";
import { PanelContainer } from "./PanelContainer";

/**
 * Sub-class of Panel Container implementing a tabbed version of PanelContainer 
 */
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

    /**
     * Child Container Management Methods
     */

    getChildContainers(): IDockContainer[] {
        return [...this.childContainers];
    }

    addContainer(container: PanelContainer) {
        this.childContainers.push(container);
        this.tabHost.performLayout(this.childContainers, false);
        this.updateState();

        container.enableDefaultContextMenu(false);
        this.updateChildContainerZIndexes();

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
        container.enableDefaultContextMenu(true);
        this.updateState();
    }

    /**
     * TabbedPanelContainer Life-Cycle Methods Overrides
     */

    protected onInitialized(): void {
        super.onInitialized();
        this.createTabHostElement(TabOrientation.Left); // By default we create TabHandles to the left
    }

    protected onInitialRender(): HTMLElement {
        const result = super.onInitialRender();
        this.injectTabHostIntoDOM();
        return result;
    }

    protected onDisposed(): void {
        super.onDisposed();
        this.tabHost.dispose();
    }

    private createTabHostElement(orientation: TabOrientation) {
        this.tabHost = new TabHost(this.getDockManager(), orientation);
        // Note: We do not support Undock & Maximization Behavior of contained Panel Containers for now
        this.tabHost.setEnableUndock(false);
        this.tabHost.setEnableMaximization(false);
        this.tabHost.setEnableTabReordering(false);
        this.tabHost.setEnableFrameHeaderVisibility(false);
    }

    private injectTabHostIntoDOM() {
        const domTabHost = this.tabHost.getDOM();
        DOM.from(domTabHost).height("100%");
        this.setContentElement(domTabHost);  
    }

    /**
     * Public API Methods
     */

    setTabOrientation(orientation: TabOrientation) {
        if(this.tabHost.getTabOrientation() !== orientation) {
            this.tabHost.dispose();
            this.createTabHostElement(orientation);
            this.tabHost.performLayout(this.childContainers, false);
            this.injectTabHostIntoDOM();            
            this.updateState();
        }
    }

    setVisible(visible: boolean): void {
        super.setVisible(visible);
        if(visible === false) {
            this.childContainers.forEach(container => container.setVisible(false));
        } else {
            this.tabHost.getSelectedTab().getContainer().setVisible(true);
        }
    }

    updateState(): void {
        super.updateState();
        this.tabHost.updateContainerState();
        this.tabHost.updateLayoutState();
        this.updateChildContainerZIndexes();
        this.childContainers?.forEach(child => child.updateState());
        this.overrideFocusedState();
    }

    setActiveChild(container: IDockContainer): void {
        this.tabHost.focusActiveTab(container);
        this.updateState();
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

    async close(): Promise<boolean> {
        const canClose = await this.getAPI().canClose?.() ?? true;
        if(canClose) {
            for(const childContainer of this.childContainers) {
                await childContainer.performClose();
            }
            await super.close();
        }
        return canClose;
    }

    // TODO: IS THIS NEEDED?
    resize(rect: IRect): void {
        // if(this.state.getCurrentState() === PanelContainerState.Maximized) {
        //     rect = RectHelper.fromDOMRect(this.dockManager.getContainerBoundingRect());
        // }
        // super.resize(rect);
        // this.updateState();
    }

    /**
     * Dragging Handlers
     */

    onDraggingStarted(): void {
        super.onDraggingStarted();
        this.childContainers.forEach(child => child.onDraggingStarted());
    }

    onDraggingEnded(): void {
        super.onDraggingEnded();
        this.childContainers.forEach(child => child.onDraggingEnded());
    }

    /**
     * Misc Private Methods
     */

    private updateChildContainerZIndexes() {
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
            this.triggerEvent("onFocused");
        } else {
            domFrameHeader.removeClass("DockerTS-FrameHeader--Selected");
        }
    }
}
