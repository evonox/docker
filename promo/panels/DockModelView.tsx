import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { DockManager } from "../../src/facade/DockManager";
import { IPanelAPI } from "../../src/common/panel-api";
import { DockNode } from "../../src/model/DockNode";
import { ContainerType } from "../../src/common/enumerations";
import Tree, { RawNodeDatum } from 'react-d3-tree';

import "./Scrollbars.css";
import "./DockModelView.css";
import { PanelContainer } from "../../src/docking-library";


function stringifyContainerType(containerType: ContainerType): string {
    switch(containerType) {
        case ContainerType.ColumnLayout: return "Splitter-Column";
        case ContainerType.RowLayout: return "Splitter-Row";
        case ContainerType.FillLayout: return "Fill-Layout";
        case ContainerType.Panel: return "Panel"
    }
}

function createTreeNode(node: DockNode): any {
    const nodeType = stringifyContainerType(node.container.getContainerType())
    const attributes: any = {};
    if(node.container.getContainerType() === ContainerType.Panel) {
        attributes["_"] = "[" + (node.container as PanelContainer).getTitle() + "]";
    }
    return {
        name: nodeType,
        attributes: attributes
    }
}

function constructTreeGraph(node: DockNode): any {
    const childNodes =  node.childNodes.map(child => constructTreeGraph(child));
    const treeNode = createTreeNode(node);
    if(childNodes.length > 0) {
        treeNode.children = childNodes;
    }

    return treeNode;
}

function DockModelView({dockManager}: {dockManager: DockManager}) {

    const [model, setModel] = React.useState<RawNodeDatum>({name: "Loading...."});

    React.useEffect(() => {
        dockManager.listenTo("onLayoutChanged", () => {
            const model = constructTreeGraph(dockManager.getModelContext().model.rootNode);
            setModel(model);   
        })
        setTimeout(() => {
            const model = constructTreeGraph(dockManager.getModelContext().model.rootNode);
            setModel(model);   
        }, 500);
    }, []);

    return (
        <div style={{height: "100%", overflow: "hidden"}}>
            <Tree 
                data={model} 
                orientation="vertical" 
                zoom={0.65} 
                translate={{x: 200, y: 50}}  
                rootNodeClassName="node__root"
                branchNodeClassName="node__branch"
                leafNodeClassName="node__leaf"
            />
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
