import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager } from "../../src/facade/DockManager";
import { IPanelAPI } from "../../src/common/panel-api";
import { TreeNode } from "primereact/treenode";
import { DockNode } from "../../src/model/DockNode";
import { ContainerType } from "../../src/common/enumerations";
import { AnimatedTree } from "react-tree-graph";

import 'react-tree-graph/dist/style.css'
import "./Scrollbars.css";


function stringifyContainerType(containerType: ContainerType): string {
    switch(containerType) {
        case ContainerType.ColumnLayout: return "Splitter-Column";
        case ContainerType.RowLayout: return "Splitter-Row";
        case ContainerType.FillLayout: return "Fill-Layout";
        case ContainerType.Panel: return "Panel"
    }
}

function createTreeNode(node: DockNode): any {
    return {
        name: stringifyContainerType(node.container.getContainerType()),
        svgProps: {
            className:"NodeClass"
        }
    }
}

function constructTreeGraph(node: DockNode): TreeNode {
    const childNodes =  node.childNodes.map(child => constructTreeGraph(child));
    const treeNode = createTreeNode(node);
    treeNode.children = childNodes;
    return treeNode;
}

function DockModelView({dockManager}: {dockManager: DockManager}) {

    const [model, setModel] = React.useState<any>(null);

    React.useLayoutEffect(() => {
        setTimeout(() => {
            const model = constructTreeGraph(dockManager.getModelContext().model.rootNode);
            setModel(model);   
        }, 1000);
    }, []);

    return (
        <div style={{height: "100%", background: "#444", overflow: "auto", stroke: "#888", fill: "#888"}}>
            { model !== null && (
                <AnimatedTree  data={model} width={800} height={600} />
            )}

        </div>
    );
}

export const DockModelViewFactoryFn = (dockManager: DockManager): IPanelAPI => {

    let root: Root;

    return {
        initialize: async (api) => {
            // Set the settings
            api.setPanelTitle("DockModel View");
            api.setPanelFAIcon("fa-solid fa-sitemap");

            // Render React Component
            const domRoot = document.createElement("div");
            domRoot.style.height = "100%";
            root = createRoot(domRoot);
            root.render(<DockModelView dockManager={dockManager} />);
            return domRoot;
        },
        onClose: async () => {
            root.unmount();
            root = undefined;
        }
    }
}
