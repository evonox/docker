import { DockManager } from "./DockManager";
import { ContainerType, DockKind, IDockContainer, IRect, OrientationKind } from "../common/declarations";
import { DockNode } from "../model/DockNode";
import { ColumnLayoutDockContainer } from "../splitter/ColumnLayoutDockContainer";
import { RowLayoutDockContainer } from "../splitter/RowLayoutDockContainer";
import { FillDockContainer } from "../tabview/FillDockContainer";
import { TabHandle } from "../tabview/TabHandle";

/**
 * DockLayoutEngine - class responsible for layout operations
 */
export class DockLayoutEngine {

    constructor(private dockManager: DockManager) {}

    /**
     * Docks a new container to the left
     */
    dockLeft(referenceNode: DockNode, newNode: DockNode) {
        this.performDock(referenceNode, newNode, OrientationKind.Row, true);
    }

    /**
     * Docks a new container to the right
     */
    dockRight(referenceNode: DockNode, newNode: DockNode) {
        this.performDock(referenceNode, newNode, OrientationKind.Row, false);       
    }

    /**
     * Docks a new container to the top
     */
    dockUp(referenceNode: DockNode, newNode: DockNode) {
        this.performDock(referenceNode, newNode, OrientationKind.Column, true);       
    }

    /**
     * Docks a new container to the bottom
     */
    dockDown(referenceNode: DockNode, newNode: DockNode) {
        this.performDock(referenceNode, newNode, OrientationKind.Column, false);              
    }

    /**
     * Docks using the "fill mode" - creates a tabbed view of containers
     */
    dockFill(referenceNode: DockNode, newNode: DockNode) {
        this.performDock(referenceNode, newNode, OrientationKind.Fill, false);                     
    }


    undock(node: DockNode) {
        // Get the parent node to remove the node from
        const parentNode = node.parent;
        if(! parentNode)
            throw new Error("Cannot undock node without a parent.");

        // Get the nodes sibling index
        const siblingIndex = parentNode.getChildNodeIndex(node);

        // Detach the node to undock from the Dock Node Tree Hierarchy
        node.detachFromParent();

        // If the parent node has less than the minimum allowed nodes, restructure the Dock Node Hierarchy
        if(parentNode.getChildCount() < parentNode.container.getMinimumChildNodeCount()) {
            /*

            // TODO: TO BE DONE - ORIGINAL ALGORITHM WORKS ONLY FOR ONE NODE AND LESS


            */
        } else {
            parentNode.performLayout(false);

            // Set the previous sibling as the active child
            if(parentNode.getChildCount() > 0) {
                const activeSiblingIndex = Math.max(0, siblingIndex - 1);
                const activeNode = parentNode.getChildNodeAt(activeSiblingIndex);
                parentNode.container.setActiveChild(activeNode.container);
            }
        }

        this.dockManager.invalidate();
        this.dockManager.notifyOnUnDock(node);
    }

    close(node: DockNode) {
        /**
         *  ORIGINAL CODE COPIED IMPLEMENTATION FROM UNDOCK ENGINE
         * 
         */
    }

    reorderTabs(node: DockNode, handle: TabHandle, state: string, index: number) {

    }

    private performDock(referenceNode: DockNode, newNode: DockNode, orientation: OrientationKind, insertBeforeReference: boolean) {

    }

    private forceResizeCompositeContainer(container: IDockContainer) {

    }

    private createDockContainer(containerType: ContainerType, newNode: DockNode, referenceNode: DockNode) {
        if(containerType === ContainerType.FillLayout) {
            return new FillDockContainer(this.dockManager);
        } else if(containerType === ContainerType.RowLayout) {
            return new RowLayoutDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
        } else if(containerType === ContainerType.ColumnLayout) {
            return new ColumnLayoutDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
        } else {
            throw new Error("Invalid DockContainer kind.");
        }
    }

    getDockBounds(referenceNode: DockNode, containerToDock: IDockContainer, direction: OrientationKind, insertBefore: boolean): IRect {
        if(direction === OrientationKind.Fill) {
            const domReferenceElement = referenceNode.container.getDOM();
            const outerRect = this.dockManager.getContainerBoundingRect();
            const referenceElementRect = domReferenceElement.getBoundingClientRect();
            return {
                x: referenceElementRect.left - outerRect.left,
                y: referenceElementRect.top - outerRect.top,
                w: referenceElementRect.width,
                h: referenceElementRect.height        
            };
        } else {


        }
    }

    private getVaryingDimension(container: IDockContainer, direction: OrientationKind): number {
        if(direction === OrientationKind.Row) {
            return container.getWidth();
        } else if(direction === OrientationKind.Column) {
            return container.getHeight();
        } else {
            throw new Error("Invalid OrientationKind");
        }
    }
}
