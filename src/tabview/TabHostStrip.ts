import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { IPoint } from "../common/dimensions";
import { TabOrientation } from "../common/enumerations";
import { ContextMenu } from "../core/ContextMenu";
import { TabStripButtonBar } from "../core/TabStripButtonBar";
import { TABSTRIP_SCROLL_LEFT, TABSTRIP_SCROLL_RIGHT, TABSTRIP_SHOW_MENU } from "../core/panel-default-buttons";
import { DockManager } from "../facade/DockManager";
import { Component } from "../framework/Component";
import { TabDualOperation } from "../operations/TabDualOperation";
import { TabReorderOperation } from "../operations/TabReorderOperation";
import { DOM } from "../utils/DOM";
import { DetectionMode, DragAndDrop } from "../utils/DragAndDrop";
import { TabHandle } from "./TabHandle";
import { TabHost } from "./TabHost";

import "./TabHostStrip.css";

/**
 * TabHostStrip is container for TabHandle DOM and manages its scrolling and context menu activation
 *      when the tab pages overflow the available visible area
 * 
 * Events:
 *      onTabActivated  - triggered when a tab is activated from the context menu
 *      onTabReordered  - trigger when user requested tab reorder
 */
export class TabHostStrip extends Component {

    private domTabStrip: DOM<HTMLElement>;
    private domTabHandleContainer: DOM<HTMLElement>;
    private domButtonBarContainer: DOM<HTMLElement>;

    private tabHandles: TabHandle[] = [];
    private buttonBar: TabStripButtonBar;

    private resizeObserver: ResizeObserver;

    private isButtonBarVisible = false;

    constructor(
        private dockManager: DockManager,
        private tabHost: TabHost,
        private orientation: TabOrientation
    ) {
        super();
        this.initializeComponent();
    }

    getTabHost(): TabHost {
        return this.tabHost;
    }

    attachTabHandle(tabHandle: TabHandle) {
        this.tabHandles.push(tabHandle);
        this.domTabHandleContainer.appendChild(tabHandle.getDOM());
        tabHandle.on("onMouseDown", event => this.handleTabOrderingRequest(event));
    }

    detachTabHandle(tabHandle: TabHandle) {
        const index = this.tabHandles.indexOf(tabHandle);
        if(index >= 0) {
            tabHandle.off("onMouseDown");
            tabHandle.detachFromDOM();
            this.tabHandles.splice(index, 1);
        }
    }

    queryAttachedHandles(): TabHandle[] {
        return [...this.tabHandles];
    }

    protected onInitialized(): void {
        this.buttonBar = new TabStripButtonBar();
    }

    protected onDisposed(): void {
        this.resizeObserver.unobserve(this.domTabStrip.get());
        this.resizeObserver.disconnect();
        this.resizeObserver = undefined;

        this.buttonBar.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domTabStrip = DOM.create("div").addClass("DockerTS-TabStrip")
            .applyClasses({
                "DockerTS-TabStrip--Horizontal": 
                    this.orientation === TabOrientation.Top || this.orientation === TabOrientation.Bottom,
                "DockerTS-TabStrip--Vertical": 
                    this.orientation === TabOrientation.Left || this.orientation === TabOrientation.Right
            }).cacheBounds(false);

        this.domTabHandleContainer = DOM.create("div").addClass("DockerTS-TabStrip__TabHandleContainer")
            .appendTo(this.domTabStrip);
        this.domButtonBarContainer = DOM.create("div").addClass("DockerTS-TabStrip__ButtonBar")
            .css("visibility", "hidden")
            .appendChild(this.buttonBar.getDOM()).appendTo(this.domTabStrip);

        this.buttonBar.on("onClicked", ({actionName, event}) => {
            if(actionName === TABSTRIP_SCROLL_LEFT) {
                this.handleScrollLeft();
            } else if(actionName === TABSTRIP_SCROLL_RIGHT) {
                this.handleScrollRight();
            } else if(actionName === TABSTRIP_SHOW_MENU) {
                this.handleShowTabStripPopup(event);
            }
        });

        this.resizeObserver = new ResizeObserver(() => this.checkTabStripOverflowStatus());
        this.resizeObserver.observe(this.domTabStrip.get(), {box: "border-box"});

        return this.domTabStrip.get();
    }

    protected onUpdate(element: HTMLElement): void {}

    private checkTabStripOverflowStatus() {
        if(this.isButtonBarVisible === false && this.isTabStripOverflown() === true) {
            this.isButtonBarVisible = true;
            this.domButtonBarContainer.css("visibility", "visible")
                .addClass("DockerTS-TabStrip__ButtonBar--Visible");
        } else if(this.isButtonBarVisible === true && this.isTabStripOverflown() === false) {
            this.isButtonBarVisible = false;
            this.domButtonBarContainer.removeClass("DockerTS-TabStrip__ButtonBar--Visible")
                .once("transitionend", () => {
                    this.domButtonBarContainer.css("visibility", "hidden");
                });
        }
    }

    private isTabStripOverflown(): boolean {
        const domNode  = this.domTabHandleContainer.get();
        if(this.orientation === TabOrientation.Top || this.orientation === TabOrientation.Bottom) {
            return domNode.scrollWidth > domNode.clientWidth;
        } else {
            return domNode.scrollHeight > domNode.clientHeight;
        }
    }

    private handleScrollLeft() {
        const scrollOffset = this.dockManager.config.tabStripScrollOffset;
        this.domTabHandleContainer.get().scrollBy({left: -scrollOffset, top: 0, behavior: "smooth"})
    }

    private handleScrollRight() {
        const scrollOffset = this.dockManager.config.tabStripScrollOffset;
        this.domTabHandleContainer.get().scrollBy({left: scrollOffset, top: 0, behavior: "smooth"})
    }

    private handleShowTabStripPopup(event: MouseEvent) {
        // Construct Context Menu 
        const contextMenuConfig = new ContextMenuConfig();
        for(let i = 0; i < this.tabHandles.length; i++) {
            const tabHandle = this.tabHandles[i];
            contextMenuConfig.appendMenuItem({
                displayOrder: i,
                icon: tabHandle.icon,
                title: tabHandle.title,
                actionName: i.toString()
            });
        }

        // Show the context menu
        const zIndex = this.dockManager.config.zIndexes.zIndexContextMenu;
        const contextMenu = new ContextMenu(contextMenuConfig);
        contextMenu.on("onAction", (actionName) => {
            const tabPageIndex = parseInt(actionName);
            this.triggerEvent("onTabActivated", tabPageIndex);
        });
        contextMenu.show(event, zIndex);
    }

    /**
     * Starts the tab ordering request
     */
    private handleTabOrderingRequest({event, tabHandle}: any) {


        const tabDualOperation = new TabDualOperation(
            this.dockManager, this, tabHandle
        );
        tabDualOperation.processMouseDown(event);

        tabDualOperation.on("onTabReordered", payload => {
            this.triggerEvent("onTabReordered", payload);
        });

        DragAndDrop.start(event, 
            event => tabDualOperation.processMouseMove(event),
             event => tabDualOperation.processMouseUp(event),
            "pointer", 
            () => {
                tabDualOperation.processCancelRequest()
            }, 
            DetectionMode.withThreshold
        );
    }
}
