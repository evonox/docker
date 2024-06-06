import { DockManager } from "./DockManager";
import { IDockContainer, IDockInfo } from "../common/declarations";
import { DockNode } from "../model/DockNode";
import { ColumnLayoutDockContainer } from "../splitter/ColumnLayoutDockContainer";
import { RowLayoutDockContainer } from "../splitter/RowLayoutDockContainer";
import { FillDockContainer } from "../containers/FillDockContainer";
import { TabHandle } from "../tabview/TabHandle";
import { ContainerType, DockKind, OrientationKind, TabOrientation } from "../common/enumerations";
import { IRect } from "../common/dimensions";
import { DOM } from "../utils/DOM";
import { RectHelper } from "../utils/rect-helper";
import { container } from "webpack";
import { SplitterDockContainer } from "../splitter/SplitterDockContainer";

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
            let grandParent = parentNode.parent;
            for(let i = 0; i < parentNode.getChildCount(); i++) {
                const otherChild = parentNode.getChildNodeAt(i);
                if(grandParent) {
                    grandParent.addChildAfter(parentNode, otherChild);
                    parentNode.detachFromParent();
                    
                    const width = parentNode.container.getWidth();
                    const height = parentNode.container.getHeight();
                    // TODO: CALL DESTROY - IS IT THE SAME???
                    // TODO: INVOKE onClose for React unMount && notifyOnClose Panel BEFORE

                    parentNode.container.dispose();
                    otherChild.container.resize({x: null, y: null, w: width, h: height});
                    grandParent.performLayout(false);

                } else {
                    parentNode.detachFromParent();
                    // TODO: CALL DESTROY - IS IT THE SAME???
                    // TODO: INVOKE onClose for React unMount && notifyOnClose Panel BEFORE
                    parentNode.container.dispose();
                    this.dockManager.setRootNode(otherChild);
                }
            }
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
        const parentNode = node?.parent;
        if(! parentNode) {
            // Note: Container might be in the dialog or tabbed panel container
            // No relayouting needed
            return;
        }

        let activeTabClosed = false;
        if(parentNode.getChildCount() > 0) {
            // TODO: GET ACTIVE CHILD ON IDockContainer and check if active tab closed
        }

        const siblingIndex = parentNode.getChildNodeIndex(node);
        node.detachFromParent();

        if(parentNode.getChildCount() < parentNode.container.getMinimumChildNodeCount()) {
            // TODO: INCORRECT IMPLEMENTATION - STUDY THE REASONS
            let grandParent = parentNode.parent;
            for(let i = 0; i < parentNode.getChildCount(); i++) {
                const otherChild = parentNode.getChildNodeAt(i);
                if(grandParent) {
                    grandParent.addChildAfter(parentNode, otherChild);
                    parentNode.detachFromParent();
                    const width = parentNode.container.getWidth();
                    const height = parentNode.container.getHeight();
                    otherChild.container.resize({x: null, y: null, w: width, h: height});
                    // TODO: CALL DESTROY - IS IT THE SAME???
                    // TODO: INVOKE onClose for React unMount && notifyOnClose Panel BEFORE
                    parentNode.container.dispose();
                    grandParent.performLayout(false);
                } else {
                    parentNode.detachFromParent();
                    // TODO: CALL DESTROY - IS IT THE SAME???
                    // TODO: INVOKE onClose for React unMount && notifyOnClose Panel BEFORE
                    parentNode.container.dispose();
                    this.dockManager.setRootNode(otherChild);
                }
            }

        } else {
            parentNode.performLayout(false);

            if(activeTabClosed) {
                const nextActiveSibling = parentNode.getChildNodeAt(Math.max(0, siblingIndex - 1));
                if(nextActiveSibling) {
                    parentNode.container.setActiveChild(nextActiveSibling.container);
                }
            }
        }

        this.dockManager.invalidate();
        // TODO: ERROR IN ORIGINAL CODE???
        this.dockManager.notifyOnUnDock(node);
    }

    queryDockInformation(node: DockNode): IDockInfo {
        const parentNode = node.parent;
        if(! parentNode)
            throw new Error("ERROR: Panel Container does not have parent node.");

        const parentContainerType = parentNode.container.getContainerType();

        if(parentContainerType === ContainerType.FillLayout) {
            if(parentNode.getChildCount() > 1) {
                let index = parentNode.getChildNodeIndex(node);
                index--;
                if(index < 0) {
                    index = parentNode.getChildCount() - 1;
                }
                return {
                    referenceNode: parentNode.getChildNodeAt(index),
                    dockKind: DockKind.Fill
                };
            } else {
                return { referenceNode: node.parent, dockKind: DockKind.Fill }
            }

        } else if(parentContainerType === ContainerType.RowLayout) {
            const ratio = (parentNode.container as SplitterDockContainer).getContainerRatio(node.container);
            if(parentNode.getChildNodeIndex(node) === 0) {
                return {
                    referenceNode: parentNode.getChildNodeAt(1),
                    dockKind: DockKind.Left,
                    ratio: ratio
                }
            } else {
                return {
                    referenceNode: parentNode.getChildNodeAt(0),
                    dockKind: DockKind.Right,
                    ratio: ratio
                }
            }
        } else if(parentContainerType === ContainerType.ColumnLayout) {
            const ratio = (parentNode.container as SplitterDockContainer).getContainerRatio(node.container);
            if(parentNode.getChildNodeIndex(node) === 0) {
                return {
                    referenceNode: parentNode.getChildNodeAt(1),
                    dockKind: DockKind.Up,
                    ratio: ratio
                }
            } else {
                return {
                    referenceNode: parentNode.getChildNodeAt(0),
                    dockKind: DockKind.Down,
                    ratio: ratio
                }
            }
        } else {
            throw new Error("ERROR: Invalid container type.");
        }
    }

    reorderTabs(node: DockNode, handle: TabHandle, state: string, index: number) {
        let N = node.getChildCount();
        let nodeIndexToDelete = state === "left" ? index :  index + 1;
        if(state === "right" && nodeIndexToDelete >= node.getChildCount()) return;
        if(state === "left" && nodeIndexToDelete <= 0) return;

        /**
         * TODO: COMPLETE LATER 
         */
    }

    private performDock(referenceNode: DockNode, newNode: DockNode, orientation: OrientationKind, insertBeforeReference: boolean) {
        if(referenceNode.parent && referenceNode.parent.container.getContainerType() === ContainerType.FillLayout)    
            referenceNode = referenceNode.parent;
        
        if(orientation === OrientationKind.Fill && referenceNode.container.getContainerType() === ContainerType.FillLayout) {
            referenceNode.addChild(newNode);
            referenceNode.performLayout(false);
            referenceNode.container.setActiveChild(newNode.container);
            this.dockManager.invalidate();
            this.dockManager.notifyOnDock(newNode);
            return;
        }

        const model = this.dockManager.getModelContext().model;
        let compositeContainer: IDockContainer;
        let compositeNode: DockNode;
        let referenceParent: DockNode;
        const containerType = this.mapOrientationToContainerType(orientation);

        if(referenceNode === model.rootNode) {
            // if(containerType === referenceNode.container.getContainerType()) {
            //     referenceParent = referenceNode.parent;
            //     console.dir(referenceParent);
            //     if(insertBeforeReference) {
            //         referenceParent.addChildBefore(referenceNode, newNode);
            //     } else {
            //         referenceParent.addChildAfter(referenceNode, newNode);
            //     }

            //     this.dockManager.rebuildLayout(this.dockManager.getModelContext().model.rootNode);
            //     compositeNode.container.setActiveChild(newNode.container);
            //     this.dockManager.invalidate();
            //     this.dockManager.notifyOnDock(newNode);
            //     return;
            //     referenceParent.performLayout(false);
            //     referenceParent.container.setActiveChild(newNode.container);  
            // } else {
                if(insertBeforeReference) {
                    compositeContainer = this.createDockContainer(containerType, newNode, referenceNode);
                    compositeNode = new DockNode(compositeContainer);
                    compositeNode.addChild(newNode);
                    compositeNode.addChild(referenceNode);
                } else {
                    compositeContainer = this.createDockContainer(containerType, referenceNode, newNode);
                    compositeNode = new DockNode(compositeContainer);
                    compositeNode.addChild(referenceNode);
                    compositeNode.addChild(newNode);
                }
            // }

            this.dockManager.setRootNode(compositeNode);
            this.dockManager.rebuildLayout(this.dockManager.getModelContext().model.rootNode);
            compositeNode.container.setActiveChild(newNode.container);
            this.dockManager.invalidate();
            this.dockManager.notifyOnDock(newNode);
            return;
        }

        if(referenceNode.parent.container.getContainerType() !== containerType) {
            referenceParent = referenceNode.parent;

            let referenceNodeWidth = referenceNode.container.getWidth();
            let referenceNodeHeight = referenceNode.container.getHeight();

            let referenceParentNodeWidth = referenceParent.container.getWidth();
            let referenceParentNodeHeight = referenceParent.container.getHeight();

            compositeContainer = this.createDockContainer(containerType, newNode, referenceNode);
            compositeNode = new DockNode(compositeContainer);

            referenceParent.addChildAfter(referenceNode, compositeNode);
            referenceNode.detachFromParent();
            // TODO: WE SHOULD NOT HAVE DOM OPERATIONS HERE - THINK OF IT
            referenceNode.container.getDOM().remove();

            if(insertBeforeReference) {
                compositeNode.addChild(newNode)
                compositeNode.addChild(referenceNode);
            } else {
                compositeNode.addChild(referenceNode);
                compositeNode.addChild(newNode)
            }

            referenceParent.performLayout(false);
            compositeNode.performLayout(true);

            compositeNode.container.setActiveChild(newNode.container);
            compositeNode.container.resize({x: null, y: null, w: referenceNodeWidth, h: referenceNodeHeight});
            referenceParent.container.resize({x: null, y: null, w: referenceNodeWidth, h: referenceParentNodeHeight});
        } else {
            referenceParent = referenceNode.parent;
            if(insertBeforeReference) {
                referenceParent.addChildBefore(referenceNode, newNode);
            } else {
                referenceParent.addChildAfter(referenceNode, newNode);
            }
            console.log("RELAYOUTING")
            referenceParent.performLayout(false);
            referenceParent.container.setActiveChild(newNode.container);
        }

        let containerWidth = newNode.container.getWidth();
        let containerHeight = newNode.container.getHeight();
        newNode.container.resize({x: null, y: null, w: containerWidth, h: containerHeight});

        this.dockManager.invalidate();
        this.dockManager.notifyOnDock(newNode);
    }

    private forceResizeCompositeContainer(container: IDockContainer) {
        const rect = RectHelper.fromDOMRect(DOM.from(container.getDOM()).getBoundingClientRect());
        container.resize(rect);
    }

    private mapOrientationToContainerType(orientation: OrientationKind): ContainerType {
        if(orientation === OrientationKind.Fill) return ContainerType.FillLayout;
        else if(orientation === OrientationKind.Row) return ContainerType.RowLayout;
        else if(orientation === OrientationKind.Column) return ContainerType.ColumnLayout;
    }

    private createDockContainer(containerType: ContainerType, newNode: DockNode, referenceNode: DockNode) {
        if(containerType === ContainerType.FillLayout) {
            return new FillDockContainer(this.dockManager, TabOrientation.Bottom);
        } else if(containerType === ContainerType.RowLayout) {
            return new RowLayoutDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
        } else if(containerType === ContainerType.ColumnLayout) {
            return new ColumnLayoutDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
        } else {
            throw new Error("Invalid DockContainer kind.");
        }
    }

    /**
     * TODO: CHECK AND REFACTOR THIS LAYOUTING ALGORITHM
     */
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
            // If the parent is FillLayout, make it the reference node
            if(referenceNode.parent && referenceNode.parent.container.getContainerType() === ContainerType.FillLayout)
                referenceNode = referenceNode.parent;

            let hierarchyModified = false;
            let compositeNode: DockNode;
            let childCount: number;
            let childPosition: number;
            if(referenceNode.parent && this.hasContainerOrientation(referenceNode.parent.container, direction)) {
                compositeNode = referenceNode.parent;
                childCount = compositeNode.getChildCount();
                childPosition = compositeNode.getChildNodeIndex(referenceNode) + (insertBefore ? 0 : 1);
            } else {
                compositeNode = referenceNode;
                childCount = 1;
                childPosition = insertBefore ? 0 : 1;
                hierarchyModified = true;
            }

            // Compute ratio of the new panel
            const splitterBarSize = 2; // TODO: GET FROM THE DOCKER CONFIGURATION 
            let targetPanelSize = 0;
            let targetPanelStart = 0;
            if(direction === OrientationKind.Row || direction === OrientationKind.Column) {
                const compositeSize = this.getVaryingDimension(compositeNode.container, direction)
                    - (childCount - 1) * splitterBarSize;
                
                const newPanelOriginalSize = this.getVaryingDimension(containerToDock, direction);
                const scaleMultiplier = compositeSize / (compositeSize + newPanelOriginalSize);
                targetPanelSize = newPanelOriginalSize * scaleMultiplier;
                if(hierarchyModified) {
                    targetPanelStart = insertBefore ? 0 : compositeSize * scaleMultiplier;
                } else {
                    for(let i = 0; i < childPosition; i++) {
                        targetPanelStart += this.getVaryingDimension(
                            compositeNode.getChildNodeAt(i).container, direction
                        );
                    }
                    targetPanelStart *= scaleMultiplier;
                }
            }

            // Compute the final dimensions of the virtually docked panel
            let bounds: IRect = {x: 0, y: 0, w: 0, h: 0};
            const outerRect = this.dockManager.getContainerBoundingRect();
            const rect = compositeNode.container.getDOM().getBoundingClientRect();
            if(direction === OrientationKind.Column) {
                bounds.x = rect.left - outerRect.left;
                bounds.y = rect.top - outerRect.top + targetPanelStart;
                bounds.w = rect.width;
                bounds.h = targetPanelSize;
            } else if(direction === OrientationKind.Row) {
                bounds.x = rect.left - outerRect.left + targetPanelStart;
                bounds.y = rect.top - outerRect.top;
                bounds.w = targetPanelSize;
                bounds.h = rect.height;
            }

            return bounds;
        }
    }

    private hasContainerOrientation(container: IDockContainer, orientation: OrientationKind) {
        if(
            (container.getContainerType() === ContainerType.FillLayout && orientation === OrientationKind.Fill) ||
            (container.getContainerType() === ContainerType.RowLayout && orientation === OrientationKind.Row) ||
            (container.getContainerType() === ContainerType.ColumnLayout && orientation === OrientationKind.Column)
        ) {
                return true;                
        } else {
            return false;
        }
    }

    getVaryingDimension(container: IDockContainer, direction: OrientationKind): number {
        if(direction === OrientationKind.Row) {
            return container.getWidth();
        } else if(direction === OrientationKind.Column) {
            return container.getHeight();
        } else {
            throw new Error("Invalid OrientationKind");
        }
    }
}
