import { Component } from "../framework/Component";
import { property, state } from "../framework/decorators";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { TabPage } from "./TabPage";
import { ContainerType, SelectionState, TabOrientation } from "../common/enumerations";

import "./TabHost.css";
import { DockManager } from "../facade/DockManager";
import { PanelContainer } from "../containers/PanelContainer";
import { TabHostStrip } from "./TabHostStrip";

export class TabHost extends Component {

    @property({defaultValue: false})
    displayCloseButton: boolean;

    @state()
    isActive = false;

    @state({defaultValue: true})
    displayTabHandles: boolean;

    private tabPages: TabPage[] = [];
    private activeTab?: TabPage;

    private domHost: DOM<HTMLElement>;
    // private domTabStrip: DOM<HTMLElement>;
    private tabStrip: TabHostStrip;
    private domSeparator: DOM<HTMLElement>;
    private domContent: DOM<HTMLElement>;

    constructor(private dockManager: DockManager, private tabStripDirection: TabOrientation) {
        super();
        this.initializeComponent();
    }

    setActive(isActive: boolean) {
        this.isActive = isActive;
        this.activeTab?.setSelectionState(SelectionState.Focused);
    }

    getActiveTab(): TabPage | undefined {
        return this.activeTab;
    }

    setActiveTab(container: IDockContainer) {
        const currentPage = this.tabPages.find(tp => tp.getContainer() === container);
        if(currentPage) {
            this.updateSelectedTabPage(currentPage, true);
            // TODO: SET ACTIVE PANEL TO DOCK CONTAINER
        }
    }

    getMinWidth(): number {
        return this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinWidth()), 0);
    }

    getMinHeight(): number {
        return this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinHeight()), 0);
    }

    updateLayoutState() {
        for(const tabPage of this.tabPages) {
            tabPage.getContainer().updateLayoutState();
        }
    }


    updateContainerState(): void {
        for(const tabPage of this.tabPages) {
            tabPage.getContainer().updateContainerState();
        }
        const activePanel = this.dockManager.getActivePanel();
        const selectedTabPage = this.tabPages.find(page => page.getContainer() === activePanel);
        
        if(selectedTabPage !== undefined && this.activeTab !== selectedTabPage) {
            this.activeTab?.setSelectionState(SelectionState.Unselected);
            this.activeTab = selectedTabPage;
            this.activeTab.setSelectionState(SelectionState.Focused);
        }
    }

    resize(width: number, height: number) {
        // this.domHost.width(width).height(height);

        // const tabStripHeight = this.domTabStrip.getHeight();
        // const separatorHeight = this.domSeparator.getHeight();
        // const contentHeight = height - tabStripHeight - separatorHeight;

        // this.domContent.height(contentHeight);

        if(this.activeTab) {
            // this.activeTab.resize(width, contentHeight);
        }

        requestAnimationFrame(() => this.resizeTabStripElement(width, height));
    }

    // TODO: SHOW BUTTONS TO SCROLL TAB HANDLES IN CASE OF OVERFLOW
    resizeTabStripElement(width: number, height?: number) {


    }

    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean) {
        const tabPages = [...this.tabPages];
        for(const tabPage of tabPages) {
            if(children.includes(tabPage.getContainer()) === false) {
                tabPage.dispose();
                const index = this.tabPages.indexOf(tabPage);
                if(index >= 0) {
                    this.tabPages.splice(index, 1);
                }
            }
        }

        // TODO: MANAGE WHICH TAB PAGES REMOVE AND WHICH TO KEEP
        //this.tabStrip.removeAllTabHandles();
        const childPanels = children.filter(c => c.getContainerType() === ContainerType.Panel);
        for(const child of childPanels) {
            if(tabPages.filter(tp => tp.getContainer() === child).length === 0) {
                child.setHeaderVisibility(this.tabStripDirection !== TabOrientation.Top);
                const tabPage = new TabPage(this.dockManager, child as PanelContainer, this.tabStripDirection);
                tabPage.on("onTabMoved", this.handleMoveTab.bind(this));
                tabPage.on("onTabPageSelected", this.handleTabPageSelected.bind(this));
                this.tabPages.push(tabPage);
                this.tabStrip.attachTabHandle(tabPage.getTabHandle());
                this.domContent.appendChild(tabPage.getDOM());
            }
        }


        // TODO: HANDLE ACTIVE TAB RESTORATION

        this.displayTabHandles = this.tabPages.length > 0;

        if(this.activeTab) {
            this.handleTabPageSelected({tabPage: this.activeTab, isActive: false});
        }
    }

    private performTabsLayout(indexes: number[]) {

    }



    protected onInitialized(): void {
        this.tabStrip = new TabHostStrip(this.dockManager, this.tabStripDirection);
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

        this.bind(this.domContent.get(), "focus", this.handleFocus);
        this.bind(this.domContent.get(), "mousedown", this.handleMouseDown);

        return this.domHost.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private handleMouseDown(event: MouseEvent) {
        /**
         *          if (this.activeTab && this.dockManager.activePanel != this.activeTab.panel)
            this.dockManager.activePanel = this.activeTab.panel;

         * 
         */

    }

    private handleFocus(event: FocusEvent) {
        /**
         *  if (this.activeTab && this.dockManager.activePanel != this.activeTab.panel)
                this.dockManager.activePanel = this.activeTab.panel;
         */

    }

    private handleMoveTab(event: any) {
        /**
         *    let index = Array.prototype.slice.call(this.tabListElement.childNodes).indexOf(e.self.elementBase);
                this.change(this, handle, e.self, e.state, index);

         * 
         */

    }

    private handleTabPageSelected(payload: any) {
        this.updateSelectedTabPage(payload.tabPage, payload.isActive);
    }

    private updateSelectedTabPage(page: TabPage, isActive: boolean) {
        this.activeTab = page;
        for(const tabPage of this.tabPages) {
            const isSelected = tabPage === this.activeTab;
            tabPage.setSelectionState(isSelected ? SelectionState.Focused : SelectionState.Unselected);
        }
    }   
}
