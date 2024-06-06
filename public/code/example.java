
/**
 * Binary Tree Node
 */

class BinaryTreeNode {

    private int value;
    private BinaryTreeNode left;
    private BinaryTreeNode right;

    public BinaryTreeNode(int value) {
        this.value = value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public int getValue() {
        return this.value;
    }

    public setLeft(BinaryTreeNode node) {
        this.left = node;
    }

    public setRight(BinaryTreeNode node) {
        this.right = node;
    }

    public BinaryTreeNode getLeft() {
        return this.left;
    }

    public BinaryTreeNode getRight() {
        return this.right;
    }
}

/**
 * Handler Processing Interface
 */
public interface INodeHandler {
    public void process(BinaryTreeNode node);
}

/**
 * TreeWalker
 */
public class TreeWalker {

    public static WalkDFS(BinaryTreeNode node, INodeHandler handler) {
        if(node.getLeft() != null) {
            WalkDFS(node.getLeft(), handler);
        }
        if(node.getRight() != null) {
            WalkDFS(node.getRight(), handler);
        }
        handler.process(node);
    }
}
