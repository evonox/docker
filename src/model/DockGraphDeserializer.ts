import { IDockContainer } from "../common/declarations";
import { ContainerType, TabOrientation } from "../common/enumerations";
import { INodeInfo, IPanelInfo } from "../common/serialization";
import { DocumentManagerContainer } from "../containers/DocumentManagerContainer";
import { FillDockContainer } from "../containers/FillDockContainer";
import { PanelContainer } from "../containers/PanelContainer";
import { DockManager } from "../facade/DockManager";
import { Dialog } from "../floating/Dialog";
import { ColumnLayoutDockContainer } from "../splitter/ColumnLayoutDockContainer";
import { RowLayoutDockContainer } from "../splitter/RowLayoutDockContainer";
import { DockModel } from "./DockModel";
import { DockNode } from "./DockNode";

/**
 * Class performing restoration of the Docking Library from serialized state
 */
export class DockGraphDeserializer {

    private documentManagerNode: DockNode;

    constructor(private dockManager: DockManager) {}

    async deserialize(json: string): Promise<DockModel> {
        const data = JSON.parse(json);
        const rootNode = await this.buildGraph(data.graphInfo);
        const dialogs = await this.buildDialogs(data.dialogsInfo);

        const model = new DockModel();
        model.setRootNode(rootNode);
        dialogs.forEach(dialog => model.dialogs.push(dialog));
        model.setDocumentManagerNode(this.documentManagerNode);
        return model;
    }

    private async buildGraph(nodeInfo: INodeInfo): Promise<DockNode> {
        const childrenNodeInfo = nodeInfo.children;
        const childNodes: DockNode[] = [];
        for(const childNodeInfo of childrenNodeInfo) {
            const childNode = await this.buildGraph(childNodeInfo);
            childNodes.push(childNode);
        }

        const container = await this.createContainer(nodeInfo, childNodes);
        const node = new DockNode(container);
        if(container instanceof DocumentManagerContainer)
            this.documentManagerNode = node;        
        childNodes.forEach(childNode => node.addChild(childNode));
        return node;
    }

    private async createContainer(nodeInfo: INodeInfo, children: DockNode[]): Promise<IDockContainer> {
        const containerType = nodeInfo.containerType;
        const containerState = nodeInfo.state;

        // Remap dock nodes to theirs containers
        const childContainers: IDockContainer[] = [];
        children.forEach(childNode => childContainers.push(childNode.container));

        // Create the Docking Container based on the serialized tyhpe
        let container;
        if(containerType === ContainerType.Panel) {
            container = await PanelContainer.loadFromState(containerState, this.dockManager);
            container.prepareForDocking();
            // TODO: Original code removes DOM node of Container - should be DOM operations in deserializer???
        } else if(containerType === ContainerType.RowLayout) {
            container = new RowLayoutDockContainer(this.dockManager, childContainers);
        } else if(containerType === ContainerType.ColumnLayout) {
            container = new ColumnLayoutDockContainer(this.dockManager, childContainers);
        } else {
            if(containerState.documentManager === true) {
                container = new DocumentManagerContainer(this.dockManager);
            } else {
                container = new FillDockContainer(this.dockManager, TabOrientation.Bottom);
            }
        }

        // Load the container state and return it
        container.loadState(containerState);
        return container;
    }

    private async  buildDialogs(dialogsInfo: IPanelInfo[]): Promise<Dialog[]> {
        const dialogs: Dialog[] = [];
        for(const dialogInfo of dialogsInfo) {
            const containerType = dialogInfo.containerType;
            const containerState = dialogInfo.state;

            if(containerType === ContainerType.Panel) {
                const container = await PanelContainer.loadFromState(containerState, this.dockManager);

                // TODO: REMOVE NODE FROM DOM - DAILOG
                // TODO: SET CONTAINER DOCKING STATE - MORE STATES THAN JUST DIALOG
                // -------------------------------------
                // TODO: SERIALIZE PANEL CONTAINER STATE
                // TODO: STATES: [COLLAPSED, EXPANDED], [FLOATING, DOCKED, MAXIMIZED, MINIMIZED, IN COLLAPSER]
                // -------------------------------------
                const dialog = new Dialog(this.dockManager, container)
                // TODO: CHECK DIALOG IS POSSIBLE TO PLACE INSIDE WINDOW
                dialog.setPosition(dialogInfo.position.x, dialogInfo.position.y);
                if(dialogInfo.isHidden) {
                    dialog.hide();
                }
                dialogs.push(dialog);
            }
        }

        return dialogs;
    }
}