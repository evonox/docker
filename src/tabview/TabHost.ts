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
                childContainer.setHeaderVisibility(this.tabStripDirection !== TabOrientation.Top);

                const tabPage = new TabPage(this.dockManager, childContainer as PanelContainer, 
                    this.tabStripDirection);

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
    }

    protected onDisposed(): void {
        this.tabStrip.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domHost = DOM.create("div").addClass("DockerTS-TabHost");
        this.domSeparator = DOM.create("div").addClass("DockerTS-TabStrip__Separator");
        this.domContent = DOM.create("div").attr("tabIndex", "-1").addClass("DockerTS-TabContent");

        if(this.tabStripDirection === TabOrientation.Top) {
            this.domHost.appendChildren([this.tabStrip.getDOM(), this.domSeparator, this.domContent])
                .addClass("DockerTS-TabHost--Top");
        } else if(this.tabStripDirection === TabOrientation.Bottom) {
            this.domHost.appendChildren([this.domContent, this.domSeparator, this.tabStrip.getDOM()])
                .addClass("DockerTS-TabHost--Bottom");
        } else {
            throw new Error("Unsupported TabStripDirection");
        }

        return this.domHost.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domSeparator.toggleClass("DockerTS-TabStrip__Separator--Focused", this.isFocused);
    }
}
