import { IDockContainer } from "../common/declarations";


export class DockNode {

    private parent: DockNode;
    private children: DockNode[] = [];

    constructor(private _container: IDockContainer) {}

    get container() {
        return this._container;
    }

    get childNodes() {
        return this.children;
    }

    detachFromParent() {
        if(this.parent) {
            this.parent.removeChild(this);
            this.parent = undefined;
        }
    }

    addChild(childNode: DockNode) {
        childNode.detachFromParent();
        childNode.parent = this;
        this.children.push(childNode);
    }

    addChildBefore(referenceNode: DockNode, childNode: DockNode) {
        this.insertChildNode(referenceNode, childNode, true);
    }

    addChildAfter(referenceNode: DockNode, childNode: DockNode) {
        this.insertChildNode(referenceNode, childNode, false);
    }

    removeChild(childNode: DockNode) {       
        const index = this.children.indexOf(childNode);
        if(index >= 0) {
            this.children.splice(index, 1);
            childNode.parent = undefined;
        }
    }

    performLayout(relayoutEvenIfEqual: boolean) {
        const childContainers = this.children.map(node => node._container);
        this._container.performLayout(childContainers, relayoutEvenIfEqual);
    }

    private insertChildNode(referenceNode: DockNode, childNode: DockNode, insertBefore: boolean) {
        childNode.detachFromParent();
        childNode.parent = this;

        const referenceIndex = this.children.indexOf(referenceNode);
        if(referenceIndex < 0)
            throw new Error("ReferenceNode is not child of this node.");

        const preList = this.children.slice(0, referenceIndex);
        const postList = this.children.slice(referenceIndex + 1, this.children.length);

        this.children = preList.slice();

        if(insertBefore) {
            this.children.push(childNode);
            this.children.push(referenceNode);
        } else {
            this.children.push(referenceNode);
            this.children.push(childNode);
        }

        this.children = this.children.concat(postList);
    }
}
