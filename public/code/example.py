

############################
# Binary Tree Node         #
############################

class BinaryTreeNode:
    
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        
    def setLeft(self, left):
        self.left = left
        
    def setRight(self, right):
        self.right
        
    def setValue(self, value):
        self.value = value
        
    def getValue(self):
        return self.value
        
    def getLeft(self):
        return self.left
    
    def getRight(self):
        return self.right
        
        
############################
# Depth First Search       #
############################
    
def DFS(node: BinaryTreeNode, handler: callable):
    if(node.getLeft() != None):
        DFS(node.getLeft(), handler)
    if(node.getRight() != None):
        DFS(node.getRight(), handler)
    handler(node)
