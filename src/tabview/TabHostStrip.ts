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
import { EventHelper } from "../utils/event-helper";
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

    private _tabReorderingEnabled = true;
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

    getTabHandleContainerDOM() {
        return this.domTabHandleContainer;
    }

    isTabReorderingEnabled(): boolean {
        return this._tabReorderingEnabled;
    }

    enabledTabReordering(flag: boolean) {
        this._tabReorderingEnabled = flag;
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
        this.buttonBar = new TabStripButtonBar(this.dockManager);
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

        this.bind(this.domTabHandleContainer.get(), "wheel", this.handleWheelScroll.bind(this));

        this.buttonBar.on("onPressed", ({actionName, event}) => {
            if(actionName === TABSTRIP_SCROLL_LEFT) {
                this.handleBeginScrollingToStart();
            } else if(actionName === TABSTRIP_SCROLL_RIGHT) {
                this.handleBeginScrollingToEnd();
            }
        });
        this.buttonBar.on("onReleased", ({actionName, event}) => {
            if(actionName === TABSTRIP_SCROLL_LEFT || actionName === TABSTRIP_SCROLL_RIGHT) {
                this.handleStopScrolling();
            }
        });
        this.buttonBar.on("onClicked", ({actionName, event}) => {
            if(actionName === TABSTRIP_SHOW_MENU) {
                this.handleShowTabStripPopup(event);
            }
        });

        this.resizeObserver = new ResizeObserver(() => this.checkTabStripOverflowStatus());
        this.domTabStrip.css("overflow", "hidden"); // Prevent recursive callback in case of content overflow
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

    /**
     * TabStrip Smooth Scrolling 
     */
    
    private isIncrementScroll: boolean;
    private handleRAFScroll: number;
    private readonly SCROLL_DELTA = 2;

    private handleBeginScrollingToStart() {
        this.isIncrementScroll = false;
        this.handleRAFScroll = window.requestAnimationFrame(() => this.handleScrollingTick());
    }

    private handleBeginScrollingToEnd() {
        this.isIncrementScroll = true;
        this.handleRAFScroll = window.requestAnimationFrame(() => this.handleScrollingTick());
    }

    private handleStopScrolling() {
        window.cancelAnimationFrame(this.handleRAFScroll);
    }

    private handleScrollingTick() {
        const scrollOffset = this.isIncrementScroll ? this.SCROLL_DELTA : -this.SCROLL_DELTA;
        if(this.orientation === TabOrientation.Top || this.orientation === TabOrientation.Bottom) {            
            this.domTabHandleContainer.get().scrollBy({left: scrollOffset, top: 0, behavior: "instant"})
        } else {
            this.domTabHandleContainer.get().scrollBy({left: 0, top: scrollOffset, behavior: "instant"})
        }
        this.handleRAFScroll = window.requestAnimationFrame(() => this.handleScrollingTick());
    }

    private handleWheelScroll(event: WheelEvent) {
        const domNode = this.domTabHandleContainer.get();
        const scrollOffset = Math.sign(event.deltaY) * Math.max((domNode.scrollWidth - domNode.clientWidth) / 10, 50);
        if(this.orientation === TabOrientation.Top || this.orientation === TabOrientation.Bottom) {            
            this.domTabHandleContainer.get().scrollBy({left: scrollOffset, top: 0, behavior: "instant"})
        } else {
            this.domTabHandleContainer.get().scrollBy({left: 0, top: scrollOffset, behavior: "instant"})
        }
    }

    /**
     * Context Menu Handling
     */

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
     * Starts the tab ordering request with the possibility to change into Undock Panel Request
     */
    private handleTabOrderingRequest({event, tabHandle}: any) {
        if(! this._tabReorderingEnabled) {
            EventHelper.suppressEvent(event);
            return;
        }
        
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
