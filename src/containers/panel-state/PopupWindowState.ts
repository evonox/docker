import { IDockInfo } from "../../common/declarations";
import { DockKind } from "../../common/enumerations";
import { DockNode } from "../../model/DockNode";
import { BrowserPopupHelper } from "../../utils/browser-popup-helper";
import { PanelContainer } from "../PanelContainer";
import { PanelStateBase } from "./PanelStateBase";

/**
 * State Active when the panel is in popup window
 */
export class PopupWindowState extends PanelStateBase {

    private popupWindow: Window;
    private dockingInfo: Map<DockNode, IDockInfo> = new Map<DockNode, IDockInfo>();
    private dockingHierarchy: Array<DockNode> = new Array<DockNode>();

    private adoptedPopupElements: HTMLElement[] = [];

    public async enterState(initialState: boolean): Promise<void> {
        await super.enterState(initialState);
        this.configureButtons({
            maximize: false, minimize: false, expand: false, collapse: false, restore: false, popup: false, pin: false
        });
        this.panel.enableDefaultContextMenu(false);

        this.saveCurrentDockingState();

        this.undockPanel();
        this.panel.updateState();

        // TODO: WHY THIS???
        setTimeout(() => {
            this.openWindowInPopup();
        });
    }

    public async leaveState(): Promise<void> {
        // Perform clean up
        this.adoptedPopupElements = [];
        this.dockingHierarchy = [];
        this.dockingInfo.clear();
        this.popupWindow = undefined;

        await super.leaveState();
    }

    async hidePopup(): Promise<boolean> {
        // Adopt the elements back the main DOM Document
        this.adoptedPopupElements.forEach(element => {
            element = document.adoptNode(element);
            document.body.appendChild(element);
        })
        // Close the popup window
        this.popupWindow.close();
        // Restore the docking state
        this.restoreOriginalDockingState();
        // Perform updates
        this.panel.activatePanel();
        this.panel.updateState();

        return true;
    }

    updateState(): void {
        super.updateState();
    }

    private undockPanel() {
        this.dockManager.requestUndock(this.panel);
    }

    private openWindowInPopup() {
        const targetElement = this.panel.getContentFrameDOM();
        const nestedContainers = this.panel.getChildContainers();
        const dependentElements = nestedContainers.map(container => {            
            return (container as PanelContainer).getContentFrameDOM().get();
        });
        this.adoptedPopupElements = [targetElement.get()].concat(dependentElements);
        
        this.popupWindow = BrowserPopupHelper.showElementInBrowserWindow(targetElement.get(), dependentElements, {
            title: this.panel.getTitle(),
            windowOffset: {
                x: 0,
                y: 0
            },
            onPopupWindowClosed: () => this.panel.hidePopupWindow()
        })
    }

    private saveCurrentDockingState() {
        let dockNode = this.dockManager.findNodeFromContainer(this.panel);
        while(dockNode.parent) {
            this.dockingHierarchy.push(dockNode);
            const dockInfo = this.dockManager.queryDockInformationForNode(dockNode);
            this.dockingInfo.set(dockNode, dockInfo);
            dockNode = dockNode.parent;
        }
    }

    private restoreOriginalDockingState() {
        for(let i = 0; i < this.dockingHierarchy.length; i++) {
            const dockNode = this.dockingHierarchy[i];
            const dockInfo = this.dockingInfo.get(dockNode);
            if(this.dockManager.existsDockNodeInModel(dockInfo.referenceNode) === false) 
                continue;
            if(dockInfo.referenceNode === this.dockManager.getDocumentNode() && dockInfo.dockKind === DockKind.Fill) {
                this.config.set("wasHeaderVisible", false);
            } else {
                this.config.set("wasHeaderVisible", true);
            }

            this.performDock(dockInfo);
            return;
        }
        // As a last resort, we dock the missing panel to the DocumentManagerNode()
        this.performDock({referenceNode: this.dockManager.getDocumentNode(), dockKind: DockKind.Fill});
    }

    private performDock(dockInfo: IDockInfo) {
        if(dockInfo.dockKind === DockKind.Fill) {
            this.dockManager.dockFill(dockInfo.referenceNode, this.panel);
        } else if(dockInfo.dockKind === DockKind.Left) {
            this.dockManager.dockLeft(dockInfo.referenceNode, this.panel, dockInfo.ratio);
        } else if(dockInfo.dockKind ===  DockKind.Right) {
            this.dockManager.dockRight(dockInfo.referenceNode, this.panel, dockInfo.ratio);
        } else if(dockInfo.dockKind ===  DockKind.Up) {
            this.dockManager.dockUp(dockInfo.referenceNode, this.panel, dockInfo.ratio);           
        } else if(dockInfo.dockKind ===  DockKind.Down) {
            this.dockManager.dockDown(dockInfo.referenceNode, this.panel, dockInfo.ratio);            
        }
    }
}
