import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager } from "../../src/facade/DockManager";
import { IPanelAPI } from "../../src/common/panel-api";
import { OrganizationChart } from 'primereact/organizationchart';
import { TreeNode } from "primereact/treenode";
import { DockNode } from "../../src/model/DockNode";
import { ContainerType } from "../../src/common/enumerations";
import { ScrollPanel } from 'primereact/scrollpanel';

import "./Scrollbars.css";

function stringifyContainerType(containerType: ContainerType): string {
    switch(containerType) {
        case ContainerType.ColumnLayout: return "Splitter-Column";
        case ContainerType.RowLayout: return "Splitter-Row";
        case ContainerType.FillLayout: return "Fill-Layout";
        case ContainerType.Panel: return "Panel"
    }
}

function createTreeNode(node: DockNode): TreeNode {
    return {
        label: "Node",
        data: {
            type: stringifyContainerType(node.container.getContainerType())
        }
    }
}

function constructOrgChart(node: DockNode): TreeNode {
    const childNodes =  node.childNodes.map(child => constructOrgChart(child));
    const treeNode = createTreeNode(node);
    treeNode.children = childNodes;
    treeNode.expanded = childNodes.length > 0;
    return treeNode;
}

function DockModelView({dockManager}: {dockManager: DockManager}) {

    const [model, setModel] = React.useState<TreeNode[]>([{}]);

    const nodeTemplate = (node: TreeNode) => {
        return (<div>{node.data?.type}</div>);
    }

    React.useLayoutEffect(() => {
        setTimeout(() => {
            const model = constructOrgChart(dockManager.getModelContext().model.rootNode);
            setModel([model]);   
        }, 1000);
    }, []);

    return (
        <div style={{height: "100%", background: "white"}}>
            <ScrollPanel style={{width: "100%", height: "100%"}} className="custombar1" >
                <OrganizationChart value={model} nodeTemplate={nodeTemplate} />
            </ScrollPanel>
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
