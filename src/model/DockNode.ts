import { IDockContainer } from "../common/declarations";


export class DockNode {

    private _parent: DockNode;
    private _children: DockNode[] = [];

    constructor(private _container: IDockContainer) {}

    get parent() {
        return this._parent;
    }

    get container() {
        return this._container;
    }

    get childNodes() {
        return this._children;
    }

    getChildNodeAt(index: number): DockNode {
        if(index < 0 || index >= this._children.length)
            throw new Error("Index out of range");
        return this._children[index];
    }

    getChildNodeIndex(node: DockNode): number {
        return this._children.indexOf(node);
    }

    getChildCount() {
        return this._children.length;
    }

    detachFromParent() {
        if(this._parent) {
            this._parent.removeChild(this);
            this._parent = undefined;
        }
    }

    addChild(childNode: DockNode) {
        childNode.detachFromParent();
        childNode._parent = this;
        this._children.push(childNode);
    }

    addChildBefore(referenceNode: DockNode, childNode: DockNode) {
        this.insertChildNode(referenceNode, childNode, true);
    }

    addChildAfter(referenceNode: DockNode, childNode: DockNode) {
        this.insertChildNode(referenceNode, childNode, false);
    }

    removeChild(childNode: DockNode) {       
        const index = this._children.indexOf(childNode);
        if(index >= 0) {
            this._children.splice(index, 1);
            childNode._parent = undefined;
        }
    }

    performLayout(relayoutEvenIfEqual: boolean) {
        const childContainers = this._children.map(node => node._container);
        this._container.performLayout(childContainers, relayoutEvenIfEqual);
    }

    private insertChildNode(referenceNode: DockNode, childNode: DockNode, insertBefore: boolean) {
        childNode.detachFromParent();
        childNode._parent = this;

        const referenceIndex = this._children.indexOf(referenceNode);
        if(referenceIndex < 0)
            throw new Error("ReferenceNode is not child of this node.");

        const preList = this._children.slice(0, referenceIndex);
        const postList = this._children.slice(referenceIndex + 1, this._children.length);

        this._children = preList.slice();

        if(insertBefore) {
            this._children.push(childNode);
            this._children.push(referenceNode);
        } else {
            this._children.push(referenceNode);
            this._children.push(childNode);
        }

        this._children = this._children.concat(postList);
    }
}
