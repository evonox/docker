import { IDockInfo } from "../common/declarations";
import { DockKind } from "../common/enumerations";
import { PanelContainer } from "../containers/PanelContainer";
import { DockManager } from "../facade/DockManager";
import { DockNode } from "../model/DockNode";

/**
 * Public API Interface for the auto-docking class
 */
export interface IAutoDock {
    getCollapserDockKind(): DockKind;
    restoreDock(): void;
    dispose(): void;
}

/**
 * Class performing automatic dock restoration algorithm
 */
class AutoDock implements IAutoDock {

    private dockingInfo: Map<DockNode, IDockInfo> = new Map<DockNode, IDockInfo>();
    private dockingHierarchy: Array<DockNode> = new Array<DockNode>();

    constructor(private dockManager: DockManager, private panel: PanelContainer) {}

        getCollapserDockKind(): DockKind {
        for(let i = 0; i < this.dockingHierarchy.length; i++) {
            const dockNode = this.dockingHierarchy[i];
            const dockInfo = this.dockingInfo.get(dockNode);
            if(dockInfo.dockKind === DockKind.Left || dockInfo.dockKind === DockKind.Right) {
                return dockInfo.dockKind;
            } else if(dockInfo.dockKind === DockKind.Up || dockInfo.dockKind === DockKind.Down) {
                return DockKind.Down;
            }
        }
        // Default docking down 
        return DockKind.Down;
    }

    scanDock(): void {
        let dockNode = this.dockManager.findNodeFromContainer(this.panel);
        while(dockNode.parent) {
            this.dockingHierarchy.push(dockNode);
            const dockInfo = this.dockManager.queryDockInformationForNode(dockNode);
            this.dockingInfo.set(dockNode, dockInfo);
            dockNode = dockNode.parent;
        }
    }

    restoreDock(): void {
        for(let i = 0; i < this.dockingHierarchy.length; i++) {
            const dockNode = this.dockingHierarchy[i];
            const dockInfo = this.dockingInfo.get(dockNode);
            if(this.dockManager.existsDockNodeInModel(dockInfo.referenceNode) === false) 
                continue;
            this.performDock(dockInfo);
            return;
        }
        // As a last resort, we dock the missing panel to the DocumentManagerNode()
        this.performDock({referenceNode: this.dockManager.getDocumentNode(), dockKind: DockKind.Fill});
    }

    dispose(): void {
        this.dockingInfo.clear();
        this.dockingHierarchy = [];
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

/**
 * Factory Method for Auto-Docking Class
 */
export class AutoDockHelper {

    static scanDockInfo(dockManager: DockManager, panel: PanelContainer): IAutoDock {
        const autoDock = new AutoDock(dockManager, panel);
        autoDock.scanDock();
        return autoDock;
    }
}
