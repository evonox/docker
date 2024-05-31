import { Component } from "../framework/Component";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { TabPage } from "./TabPage";
import { ContainerType, SelectionState, TabOrientation } from "../common/enumerations";
import { DockManager } from "../facade/DockManager";
import { PanelContainer } from "../containers/PanelContainer";
import { TabHostStrip } from "./TabHostStrip";

import "./TabHost.css";
import { ArrayUtils } from "../utils/ArrayUtils";
import { state } from "../framework/decorators";

export class TabHost extends Component {

    @state()
    private isFocused: boolean;

    // Flag means whether a undock operation is allowed on the TabHandle components
    private isUndockEnabled: boolean = true;

    // Tab Page references
    private tabPages: TabPage[] = [];
    private selectedTab?: TabPage;

    // Internal DOM references
    private domHost: DOM<HTMLElement>;
    private tabStrip: TabHostStrip;
    private domSeparator: DOM<HTMLElement>;
    private domContent: DOM<HTMLElement>;

    constructor(private dockManager: DockManager, private tabStripDirection: TabOrientation) {
        super();
        this.initializeComponent();
    }

    setEnableUndock(flag: boolean) {
        this.isUndockEnabled = flag;
        this.tabPages.forEach(page => page.setUndockEnabled(flag));
    }

    setTabOrientation(tabOrientation: TabOrientation) {
        this.tabStripDirection = tabOrientation;
        // TODO: DESTROY INTERNALS
        // TODO: RE-CONSTRUCT INTERNALS
    }

    getSelectedTab(): TabPage | undefined {
        return this.selectedTab;
    }

    focusActiveTab(container: IDockContainer) {
        if(this.isContainerInsideHost(container) === false) {
            this.selectedTab.setSelectionState(SelectionState.Selected);
        } else {
            this.selectedTab?.setSelectionState(SelectionState.Unselected);
            const newActiveTabPage = this.getTabPageForContainer(container);
            if(newActiveTabPage !== undefined) {
                this.selectedTab = newActiveTabPage;
                newActiveTabPage.setSelectionState(SelectionState.Focused);
            }
        }

        this.isFocused = this.selectedTab.getSelectionState() === SelectionState.Focused;

    }

    getMinWidth(): number {
        return this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinWidth()), 0);
    }

    getMinHeight(): number {
        return this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinHeight()), 0);
    }

    updateLayoutState() {
        this.tabPages.forEach(tabPage => tabPage.getContainer().updateLayoutState());
    }

    updateContainerState(): void {
        this.tabPages.forEach(tabPage => tabPage.getContainer().updateContainerState());

        const activePanel = this.dockManager.getActivePanel();
        if(activePanel !== this.selectedTab?.getContainer()) {
            if(this.isContainerInsideHost(activePanel)) {
                this.focusActiveTab(activePanel);
            } else {
                this.selectedTab?.setSelectionState(SelectionState.Selected);
                this.isFocused = false;
            }
        } else {
            this.selectedTab?.setSelectionState(SelectionState.Focused);
            this.isFocused = true;
        }
    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        // Save selected tab index
        let selectedTabIndex = this.tabPages.indexOf(this.selectedTab);

        // Remove old tab pages
        const tabPages = [...this.tabPages];
        for(const tabPage of tabPages) {
            if(children.includes(tabPage.getContainer()) === false) {
                this.tabStrip.detachTabHandle(tabPage.getTabHandle());
                ArrayUtils.removeItem(this.tabPages, tabPage);
                tabPage.dispose();
            }
        }

        if(children.length === 0)
            return;

        // Add tab pages for new child containrs
        for(const childContainer of children) {
            if(childContainer.getContainerType() !== ContainerType.Panel)
                throw new Error("ERROR: Only panel containers are allowed to be inserted inside TabHost");
            if(this.isContainerInsideHost(childContainer) === false) {
                childContainer.setHeaderVisibility(this.tabStripDirection === TabOrientation.Bottom);

                const tabPage = new TabPage(this.dockManager, childContainer as PanelContainer, 
                    this.tabStripDirection, this.isUndockEnabled);

                this.tabPages.push(tabPage);
                this.tabStrip.attachTabHandle(tabPage.getTabHandle());
                this.domContent.appendChild(tabPage.getDOM());
            }
        }

        if(this.selectedTab === undefined || children.includes(this.selectedTab.getContainer()) === false) {
            this.selectedTab = undefined;
            // Note: if selected tab is removed, we select the preceeding one 
            // (only selecting , not giving focus)
            selectedTabIndex = Math.max(0, selectedTabIndex - 1); 
            this.selectedTab = this.tabPages[selectedTabIndex];
            this.selectedTab.setSelectionState(SelectionState.Selected);
        }
    }

    private isContainerInsideHost(container: IDockContainer): boolean {
        return this.getTabPageForContainer(container) !== undefined;
    }

    private getTabPageForContainer(container: IDockContainer): TabPage | undefined {
        return this.tabPages.find(page => page.getContainer() === container);
    }

    /**
     * Component Life-Cycle Methods
     */

    protected onInitialized(): void {
        this.tabStrip = new TabHostStrip(this.dockManager, this.tabStripDirection);
        this.tabStrip.on("onTabActivated", tabIndex => {
            const activePanel = this.tabPages[tabIndex].getContainer();
            this.dockManager.setActivePanel(activePanel);
        });
        this.tabStrip.on("onTabReordered", ({from, to}) => {
            this.handleReorderTabs(from, to);
        });
        this.tabStrip.on("onDockingDragStart", this.handleDockingDragStart.bind(this));
        this.tabStrip.on("onDockingDragMove", this.handleDockingDragMove.bind(this));
        this.tabStrip.on("onDockingDragStop", this.handleDockingDragEnd.bind(this));
    }

    protected onDisposed(): void {
        this.tabStrip.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domHost = DOM.create("div").addClass("DockerTS-TabHost");
        this.domSeparator = DOM.create("div").applyClasses({
            "DockerTS-TabStrip__Separator--Vertical": 
                this.tabStripDirection === TabOrientation.Top || this.tabStripDirection === TabOrientation.Bottom,
            "DockerTS-TabStrip__Separator--Horizontal":
                this.tabStripDirection === TabOrientation.Left || this.tabStripDirection === TabOrientation.Right
        });
        this.domContent = DOM.create("div").attr("tabIndex", "-1").addClass("DockerTS-TabContent");

        if(this.tabStripDirection === TabOrientation.Top) {
            this.domHost.appendChildren([this.tabStrip.getDOM(), this.domSeparator, this.domContent])
                .addClass("DockerTS-TabHost--Top");
        } else if(this.tabStripDirection === TabOrientation.Bottom) {
            this.domHost.appendChildren([this.domContent, this.domSeparator, this.tabStrip.getDOM()])
                .addClass("DockerTS-TabHost--Bottom");
        } else if(this.tabStripDirection === TabOrientation.Left) {
            this.domHost.appendChildren([this.tabStrip.getDOM(), this.domSeparator, this.domContent])
                .addClass("DockerTS-TabHost--Left");
        } else if(this.tabStripDirection === TabOrientation.Right) {
            this.domHost.appendChildren([this.domContent, this.domSeparator, this.tabStrip.getDOM()])
                .addClass("DockerTS-TabHost--Right");
        }

        return this.domHost.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domSeparator.toggleClass("DockerTS-TabStrip__Separator--Focused", this.isFocused);
    }

    private handleReorderTabs(from: number, to: number) {
        // Perform child container reordering
        let childContainers = this.tabPages.map(page => page.getContainer());
        const movedContainer = childContainers[from];
        childContainers.splice(from, 1);
        childContainers.splice(to, 0, movedContainer);
       
        // Free all the internals
        this.performLayout([], false);
        // Introduce the new children layout
        this.performLayout(childContainers, false);
        // Set Active Panel
        this.selectedTab = undefined;
        this.updateContainerState();
        this.updateLayoutState();
        this.dockManager.setActivePanel(movedContainer);
    }

    // Dragged Panel Container in Dock / Undock Operation
    private draggedPanel: PanelContainer;

    private async handleDockingDragStart({event, dragOffset, tabHandle}: any) {
        const tabPage = this.tabPages.find(page => page.getTabHandle() === tabHandle);
        this.draggedPanel = tabPage.getContainer();
        await this.draggedPanel.requestUndockToDialog(event, dragOffset);
        this.draggedPanel.triggerEvent("onDockingDragStart", event);       
    }

    private handleDockingDragMove(event: MouseEvent) {
        this.draggedPanel.triggerEvent("onDockingDragMove", event);
    }

    private handleDockingDragEnd(event: MouseEvent) {
        this.draggedPanel.triggerEvent("onDockingDragStop", event);
    }
}
