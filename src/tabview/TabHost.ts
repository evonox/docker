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
import { IRect } from "../common/dimensions";
import { RectHelper } from "../utils/rect-helper";
import { TabHandle } from "./TabHandle";
import { DOMUpdateInitiator } from "../utils/DOMUpdateInitiator";

export class TabHost extends Component {

    @state()
    private isFocused: boolean;

    // Flag means whether a undock operation is allowed on the TabHandle components
    private isUndockEnabled: boolean = true;
    private isMaximizationEnabled: boolean = true;
    private isFrameHeaderVisibilityEnabled: boolean = true;

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

    setEnableMaximization(flag: boolean) {
        this.isMaximizationEnabled = flag;
        this.tabPages.forEach(page => page.setMaximizationEnabled(flag));
    }

    setEnableTabReordering(flag: boolean) {
        this.tabStrip.enabledTabReordering(flag);
    }

    setEnableFrameHeaderVisibility(flag: boolean) {
        this.isFrameHeaderVisibilityEnabled = flag;
    }

    getTabOrientation() {
        return this.tabStripDirection;
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
        let minWidth = this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinWidth()), 0);
        if(this.tabStripDirection === TabOrientation.Left || this.tabStripDirection === TabOrientation.Right) {
            const tabStripWidth = DOM.from(this.tabStrip.getDOM()).getOffsetRect().w;
            minWidth += tabStripWidth;
        }
        return minWidth;
    }

    getMinHeight(): number {
        let minHeight = this.tabPages.reduce((prev, tabPage) => Math.max(prev, tabPage.getContainer().getMinHeight()), 0);
        if(this.tabStripDirection === TabOrientation.Top || this.tabStripDirection === TabOrientation.Bottom) {
            const tabStripHeight = DOM.from(this.tabStrip.getDOM()).getOffsetRect().h;
            minHeight += tabStripHeight + this.domSeparator.getOffsetRect().h;
        }
        return minHeight;
    }

    updateLayoutState() {
        this.tabPages.forEach(tabPage => tabPage.getContainer().updateState());
    }

    updateContainerState(): void {
        this.tabPages.forEach(tabPage => tabPage.getContainer().updateState());

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
                childContainer.setHeaderVisibility(
                    this.tabStripDirection === TabOrientation.Bottom && this.isFrameHeaderVisibilityEnabled
                );

                const tabPage = new TabPage(this.dockManager, childContainer as PanelContainer, 
                    this.tabStripDirection, this.isUndockEnabled, this.isMaximizationEnabled);

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

    resize(rect: IRect) {
        return;
        const domTabHost = DOM.from(this.getDOM());
        if(RectHelper.isSizeOnly(rect)) {
            rect.x = domTabHost.getLeft();
            rect.y = domTabHost.getTop();
        }
        domTabHost.applyRect(rect);
        const tabContentRect =  this.computeTabContentRect(rect);
        this.tabPages.forEach(page => page.getContainer().resize(tabContentRect));
    }

    invalidate() {
        return;
        const domBounds = this.getDOM().getBoundingClientRect();
        const rect = RectHelper.fromDOMRect(domBounds);
        this.resize(rect);
    }

    private computeTabContentRect(rect: IRect): IRect {
        if(this.tabStripDirection === TabOrientation.Top) {
            const headerHeight = DOM.from(this.tabStrip.getDOM()).getHeight() + this.domSeparator.getHeight();
            return RectHelper.from(rect.x, rect.y + headerHeight, rect.w, rect.h - headerHeight);
        } else if(this.tabStripDirection === TabOrientation.Bottom) {
            const headerHeight = DOM.from(this.tabStrip.getDOM()).getHeight() + this.domSeparator.getHeight();
            return RectHelper.from(rect.x, rect.y, rect.w, rect.h - headerHeight);
        } else if(this.tabStripDirection === TabOrientation.Left) {
            const headerWidth = DOM.from(this.tabStrip.getDOM()).getWidth() + this.domSeparator.getWidth();
            return RectHelper.from(rect.x + headerWidth, rect.y , rect.w - headerWidth, rect.h);

        } else if(this.tabStripDirection === TabOrientation.Right) {
            const headerWidth = DOM.from(this.tabStrip.getDOM()).getWidth() + this.domSeparator.getWidth();
            return RectHelper.from(rect.x , rect.y , rect.w - headerWidth, rect.h);
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
        this.tabStrip = new TabHostStrip(this.dockManager, this, this.tabStripDirection);
        this.tabStrip.on("onTabActivated", tabIndex => {
            const activePanel = this.tabPages[tabIndex].getContainer();
            this.dockManager.setActivePanel(activePanel);
        });
        this.tabStrip.on("onTabReordered", ({from, to}) => {
            this.handleReorderTabs(from, to);
        });
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
        }).cacheBounds(false);

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

        DOMUpdateInitiator.forceAllEnqueuedUpdates();
        const rect = movedContainer.getPlaceholderDOM().getBoundingClientRect();
        movedContainer.getContentFrameDOM().applyRect(rect);   

    }

    getTabPageByHandle(tabHandle: TabHandle): TabPage {
        return this.tabPages.find(page => page.getTabHandle() === tabHandle);
    }
}
