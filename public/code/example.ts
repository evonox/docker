
/**
 * Binary Tree Node
 */

class BinaryTreeNode {

    private left: BinaryTreeNode;
    private right: BinaryTreeNode;
    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    setValue(value: number) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    setLeft(node: BinaryTreeNode) {
        this.left = node;
    }

    setRight(node: BinaryTreeNode) {
        this.right = node;
    }

    getLeft(): BinaryTreeNode {
        return this.left;
    }

    getRight(): BinaryTreeNode {
        return this.right;
    }
}

/**
 * Depth First Search Tree Walker
 */

class TreeWalkerDFS {

    static walkDFS(node: BinaryTreeNode, handler: (node: BinaryTreeNode) => void) {
        if(node.getLeft() !== undefined) {
            this.walkDFS(node.getLeft(), handler);
        }
        if(node.getRight() !== undefined) {
            this.walkDFS(node.getRight(), handler);
        }
        handler(node);
    }
}
