import { Component } from "../framework/Component";
import { ComponentEventSubscription } from "../framework/component-events";
import { state } from "../framework/decorators";
import { TabHandle } from "./TabHandle";
import { DOM } from "../utils/DOM";
import { PanelContainer } from "../containers/PanelContainer";
import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { DockManager } from "../facade/DockManager";
import { ContextMenu } from "../core/ContextMenu";
import { SelectionState, TabOrientation } from "../common/enumerations";

/**
 * TabPage - component for a single tab inside Document Manager, TabbedPanelContainer or FillDockContainer
 * 
 * Events:
 *       onTabMoved - triggered when the user requests the tab reorder
 */
export class TabPage extends Component {

    @state({defaultValue: SelectionState.Unselected})
    selectionState: SelectionState;

    private tabHandle: TabHandle;
    private domContentWrapper: DOM<HTMLElement>;

    private titleSubscription: ComponentEventSubscription;
    private focusSubscription: ComponentEventSubscription;

    constructor(
        private dockManager: DockManager, 
        private container: PanelContainer,
        private tabOrientation: TabOrientation,
        private isUndockEnabled: boolean
    ) {
        super();
        this.initializeComponent();
    }

    getTabHandle() {
        return this.tabHandle;
    }

    getContainer(): PanelContainer {
        return this.container;
    }

    setSelectionState(state: SelectionState) {
        this.selectionState = state;
    }

    getSelectionState(): SelectionState {
        return this.selectionState;
    }

    setUndockEnabled(flag: boolean) {
        this.tabHandle.setUndockEnabled(flag);
    }

    /**
     * Component Life-Cycle Handlers
     */

    protected onInitialized(): void {
        this.tabHandle = new TabHandle(this.isUndockEnabled);
        this.tabHandle.orientation = this.tabOrientation;

        this.tabHandle.on("onTabClicked", this.handleTabSelected.bind(this));
        this.tabHandle.on("onTabMoved", this.handleTabMoved.bind(this));
        this.tabHandle.on("onContextMenu", this.handleShowContextMenu.bind(this));
        this.tabHandle.on("onCloseClicked", this.handleCloseButtonClick.bind(this));
        this.tabHandle.on("onTabDblClicked", this.handleTabDoubleClicked.bind(this));

        this.titleSubscription = this.container.on("onTitleChanged", this.handleTitleChanged.bind(this));
        this.focusSubscription = this.container.on("onFocused", this.handlePanelFocused.bind(this));
    }

    protected onDisposed(): void {
        this.tabHandle.dispose();

        this.titleSubscription.unsubscribe();
        this.focusSubscription.unsubscribe();
    }

    protected onInitialRender(): HTMLElement {
        this.domContentWrapper = DOM.create("div")
            .addClass("DockerTS-TabPage--ContentWrapper")
            .appendChild(this.container.getDOM());
            
        this.updateTabTitle();

        return this.domContentWrapper.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.tabHandle.setSelectionState(this.selectionState);

        if(this.selectionState === SelectionState.Unselected) {
            this.domContentWrapper.hide();
            this.container.setVisible(false);
        } else {
            this.domContentWrapper.show();
            this.container.setVisible(true);
        }
    }

    /**
     * Event Handler Implementatios
     */

    private handleCloseButtonClick() {
        this.dockManager.requestClose(this.container);
    }

    private handleTitleChanged() {
        this.updateTabTitle();
    }

    private handlePanelFocused() {
        this.handleTabSelected();
    }

    private handleTabSelected() {
        this.dockManager.setActivePanel(this.container);
        this.dockManager.notifyOnTabChange(this);
    }

    private handleTabDoubleClicked() {
        this.container.toggleMaximizedPanelState();
    }

    private handleTabMoved(payload: any) {
        this.triggerEvent("onTabMoved", payload);
    }

    /**
     * Misc Helper Methods
     */

    private updateTabTitle() {
        const title = (this.container as PanelContainer).getTitleHtml();
        this.tabHandle.icon = this.container.getTitleIcon();
        this.tabHandle.title = this.container.getTitle();
        this.tabHandle.isModifiedState = this.container.hasChanges();
    }

    private handleShowContextMenu(event: MouseEvent) {
        event.preventDefault();

        // Request container to provide the context menu definition
        const contextMenuConfig = new ContextMenuConfig();
        this.container.onQueryContextMenu?.(contextMenuConfig);
        if(contextMenuConfig.getMenuItems().length === 0)
            return;

        // Show the context menu
        const zIndexContextMenu = this.dockManager.config.zIndexes.zIndexContextMenu;
        const domContextMenu = new ContextMenu(contextMenuConfig);
        domContextMenu.on("onAction", (actionName) => {
            this.container.handleContextMenuAction(actionName);
        });
        domContextMenu.show(event, zIndexContextMenu);
    }
}
