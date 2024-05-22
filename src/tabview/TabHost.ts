import { Component } from "../framework/Component";
import { property, state } from "../framework/decorators";
import { IDockContainer } from "../common/declarations";
import { DOM } from "../utils/DOM";
import { TabPage } from "./TabPage";
import { ContainerType, TabHostDirection } from "../common/enumerations";


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
    private domTabStrip: DOM<HTMLElement>;
    private domSeparator: DOM<HTMLElement>;
    private domContent: DOM<HTMLElement>;

    constructor(private tabStripDirection: TabHostDirection) {
        super();
        this.initializeComponent();
    }

    setActive(isActive: boolean) {
        this.isActive = isActive;
        this.activeTab?.setActive(isActive);
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
        throw 0;
    }

    getMinHeight(): number {
        throw 0;
    }

    resize(width: number, height: number) {
        this.domHost.css("width", `${width}px`).css("height", `${height}px`);

        const tabStripHeight = this.domTabStrip.getHeight();
        const separatorHeight = this.domSeparator.getHeight();
        const contentHeight = height - tabStripHeight - separatorHeight;
        this.domContent.css("height", `${contentHeight}px`);

        if(this.activeTab) {
            this.activeTab.resize(width, height);
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

        const childPanels = children.filter(c => c.getContainerType() === ContainerType.Panel);
        for(const child of childPanels) {
            if(tabPages.filter(tp => tp.getContainer() === child).length === 0) {
                const tabPage = new TabPage(child);
                tabPage.on("onTabMoved", this.handleMoveTab);
                this.tabPages.push(tabPage);
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



    protected onInitialized(): void {}

    protected onDisposed(): void {}

    protected onInitialRender(): HTMLElement {
        this.domHost = DOM.create("div").addClass("dockspan-tab-host");
        this.domTabStrip = DOM.create("div").addClass("dockspan-tab-handle-list-container");
        this.domSeparator = DOM.create("div").addClass("dockspan-tab-handle-content-seperator");
        this.domContent = DOM.create("div").attr("tabIndex", "0").addClass("dockspan-tab-content");

        if(this.tabStripDirection === TabHostDirection.Top) {
            this.domHost.appendChildren([this.domTabStrip, this.domSeparator, this.domContent]);
        } else if(this.tabStripDirection === TabHostDirection.Bottom) {
            this.domHost.appendChildren([this.domContent, this.domSeparator, this.domTabStrip]);
        } else {
            throw new Error("Unsupported TabStripDirection");
        }

        this.bind(this.domContent.get(), "focus", this.handleFocus);
        this.bind(this.domContent.get(), "mousedown", this.handleMouseDown);

        return this.domHost.get();
    }

    protected onUpdate(element: HTMLElement): void {
        this.domTabStrip.toggleClass("dockspan-tab-handle-list-container-visible", this.displayTabHandles);
        this.domSeparator.toggleClass("dockspan-tab-handle-content-seperator-visible", this.displayTabHandles);

        this.domSeparator.toggleClass("dockspan-tab-handle-content-seperator-active", this.isActive);
    }

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
            tabPage.setSelected(isSelected, isActive);
        }
    }   
}
