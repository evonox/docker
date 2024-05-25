import { ContextMenuConfig } from "../api/ContextMenuConfig";
import { TabOrientation } from "../common/enumerations";
import { ContextMenu } from "../core/ContextMenu";
import { TabStripButtonBar } from "../core/TabStripButtonBar";
import { TABSTRIP_SHOW_MENU } from "../core/panel-default-buttons";
import { DockManager } from "../facade/DockManager";
import { Component } from "../framework/Component";
import { DOM } from "../utils/DOM";
import { TabHandle } from "./TabHandle";

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

    private tabHandles: TabHandle[] = [];
    private buttonBar: TabStripButtonBar;

    constructor(
        private dockManager: DockManager,
        private orientation: TabOrientation
    ) {
        super();
        this.initializeComponent();
    }

    removeAllTabHandles() {
        this.tabHandles = [];
        this.domTabHandleContainer.removeAllChildren();
    }

    attachTabHandle(tabHandle: TabHandle) {
        this.tabHandles.push(tabHandle);
        this.domTabHandleContainer.appendChild(tabHandle.getDOM());
    }

    protected onInitialized(): void {
        this.buttonBar = new TabStripButtonBar();
    }

    protected onDisposed(): void {
        this.buttonBar.dispose();
    }

    protected onInitialRender(): HTMLElement {
        this.domTabStrip = DOM.create("div").addClass("DockerTS-TabStrip")
            .applyClasses({
                "DockerTS-TabStrip--Horizontal": 
                    this.orientation === TabOrientation.Top || this.orientation === TabOrientation.Bottom,
                "DockerTS-TabStrip--Vertical": 
                    this.orientation === TabOrientation.Left || this.orientation === TabOrientation.Right
            });

        this.domTabHandleContainer = DOM.create("div").addClass("DockerTS-TabStrip__TabHandleContainer")
            .appendTo(this.domTabStrip);
        this.domTabStrip.appendChild(this.buttonBar.getDOM());

        this.buttonBar.on("onClicked", ({actionName, event}) => {
            if(actionName === TABSTRIP_SHOW_MENU) {
                this.handleShowTabStripPopup(event);
            }
        });

        return this.domTabStrip.get();
    }

    protected onUpdate(element: HTMLElement): void {
        // TODO: RESIZE OBSERVER - MEASURE SCROLL WIDTH AND CLIENT WITH OF HANDLE DOM CONTAINER
        // TODO: UPDATE SHOWING AND HIDING BUTTONS
        // TODO: PROCESS SCROLL LEFT AND RIGHT
        // TODO; PROCESS CONTEXT MENU POPUP WITH ACTION TRIGGER
        // TODO: HANDLE TAB REODER FEATURE IN THE NEAR FUTURE 
    }

    // TODO: INVOKED BY THE RESIZER ELEMENT
    private checkTabStripOverflowStatus() {

    }

    // TODO: MEASURE CLIENT WIDTH OR HEIGHT
    private isTabStripOverflown(): boolean {
        throw 0;
    }

    // NEED TO BIND MOUSE DOWN AND UP EVENTS
    private handleScrollLeft() {

    }

    // NEED TO BIND MOUSE DOWN AND UP EVENTS
    private handleScrollRight() {

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
}
