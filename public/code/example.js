
/**
 * Binary Tree Node
 */

class BinaryTreeNode {

    constructor(value) {
        this.value = value;
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    setLeft(node) {
        this.left = node;
    }

    setRight(node) {
        this.right = node;
    }

    getLeft() {
        return this.left;
    }

    getRight() {
        return this.right;
    }
}

/**
 * Depth First Search Tree Walker
 */

class TreeWalkerDFS {

    static walkDFS(node, handler) {
        if(node.getLeft() !== undefined) {
            this.walkDFS(node.getLeft(), handler);
        }
        if(node.getRight() !== undefined) {
            this.walkDFS(node.getRight(), handler);
        }
        handler(node);
    }
}
