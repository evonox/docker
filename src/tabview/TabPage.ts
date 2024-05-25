import { Component } from "../framework/Component";
import { ComponentEventSubscription } from "../framework/component-events";
import { state } from "../framework/decorators";
import { IDockContainer } from "../common/declarations";
import { TabHandle } from "./TabHandle";
import { DOM } from "../utils/DOM";
import { PanelContainer } from "../containers/PanelContainer";
import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { DockManager } from "../facade/DockManager";
import { ContextMenu } from "../core/ContextMenu";
import { SelectionState, TabOrientation } from "../common/enumerations";


export class TabPage extends Component {

    @state({defaultValue: false})
    isSelected: boolean;

    @state({defaultValue: false})
    isActive: boolean;

    private domContentWrapper: DOM<HTMLElement>;

    private tabHandle: TabHandle;
    private titleSubscription: ComponentEventSubscription;
    private focusSubscription: ComponentEventSubscription;

    constructor(
        private dockManager: DockManager, 
        private container: IDockContainer,
        private tabOrientation: TabOrientation
    ) {
        super();
        this.initializeComponent();
    }

    getTabHandleDOM() {
        return this.tabHandle.getDOM();
    }

    getContainer(): IDockContainer {
        return this.container;
    }

    setActive(flag: boolean) {
        this.isSelected = true;
        this.isActive = flag;
    }

    setSelected(flag: boolean, isActive: boolean) {
        this.isSelected = flag;
        this.isActive = isActive;
        if(this.isSelected === false) {
            this.isActive = false;
        }
    }

    getMinWidth(): number {
        return this.container.getMinWidth();
    }

    getMinHeight(): number {
        return this.container.getMinHeight();
    }

    resize(width: number, height: number) {
        this.container.resize(width, height);
    }

    updateLayoutState() {
        this.container.updateLayoutState();
    }

    updateContainerState(): void {
        this.container.updateContainerState();
    }    

    protected onInitialized(): void {
        this.tabHandle = new TabHandle();
        this.tabHandle.orientation = this.tabOrientation;
        this.tabHandle.on("onTabClicked", this.handleTabSelected.bind(this));
        this.tabHandle.on("onTabMoved", this.handleTabMoved.bind(this));
        this.tabHandle.on("onContextMenu", this.handleShowContextMenu.bind(this));
        this.tabHandle.on("onCloseClicked", this.handleCloseButtonClick.bind(this));

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

        this.container.setVisible(this.isSelected);

        return this.domContentWrapper.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.tabHandle.setSelectionState(this.isSelected ? SelectionState.Selected : SelectionState.Unselected);
        if(this.isActive) {
            this.tabHandle.setSelectionState(SelectionState.Focused);
        }

        this.container.setVisible(this.isSelected);

        if(this.isSelected) {
            this.domContentWrapper.show();
        } else {
            this.domContentWrapper.hide();
        }
    }

    private handleCloseButtonClick() {
        console.log("onClose Click");
    }

    private handleTabSelected() {
        this.dockManager.setActivePanel(this.container as PanelContainer);
        this.triggerEvent("onTabPageSelected", {tabPage: this, isActive: true});
        // DOCK CONTAINER - NOTIFY ON TAB CHANGED
    }

    private updateTabTitle() {
        const title = (this.container as PanelContainer).getTitleHtml();
        this.tabHandle.titleTemplate = title;
        this.tabHandle.isModifiedState = this.container.hasChanges();
    }

    private handleTitleChanged() {
        this.updateTabTitle();
    }

    private handlePanelFocused() {
        this.handleTabSelected();
    }

    private handleTabMoved(payload: any) {
        this.triggerEvent("onTabMoved", payload);
    }

    private handleShowContextMenu(event: MouseEvent) {
        event.preventDefault();

        const contextMenuConfig = new ContextMenuConfig();
        this.container.onQueryContextMenu?.(contextMenuConfig);
        if(contextMenuConfig.getMenuItems().length === 0)
            return;

        const zIndexContextMenu = this.dockManager.config.zIndexes.zIndexContextMenu;
        const domContextMenu = new ContextMenu(contextMenuConfig);
        domContextMenu.on("onAction", (actionName) => {
            this.container.handleContextMenuAction(actionName);
        });
        domContextMenu.show(event, zIndexContextMenu);
    }
}
