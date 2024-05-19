import { INodeInfo, IPanelInfo, IState } from "../common/serialization";
import { Dialog } from "../floating/Dialog";
import { DockModel } from "./DockModel";
import { DockNode } from "./DockNode";

/**
 * Class performing the docking library state serialization process 
 */
export class DockGraphSerializer {

    serialize(model: DockModel): string {
        const graphInfo = this.buildGraphInfo(model.rootNode);
        const dialogs = this.sortDialogsByZIndex(model.dialogs);
        const dialogsInfo = this.buildDialogsInfo(dialogs);

        return JSON.stringify({graphInfo, dialogsInfo});
    }

    private buildGraphInfo(node: DockNode): INodeInfo {
        const nodeState: IState = {}
        node.container.saveState(nodeState);

        const childNodeInfo: INodeInfo[] = [];
        node.childNodes.forEach(childNode => {
            childNodeInfo.push(this.buildGraphInfo(childNode));
        });

        const nodeInfo: INodeInfo = {
            state: nodeState,
            children: childNodeInfo,
            containerType: node.container.getContainerType()
        }

        return nodeInfo;
    }

    private buildDialogsInfo(dialogs: Dialog[]): IPanelInfo[] {
        const dialogInfo: IPanelInfo[] = [];

        dialogs.forEach(dialog => {
            const panelState: IState = {}
            const panelContainer = dialog.getPanel();
            panelContainer.saveState(panelState);

            const panelInfo: IPanelInfo = {
                state: panelState,
                containerType: panelContainer.getContainerType(),
                position: panelContainer.getPosition(),
                isHidden: panelContainer.isHidden()
            }

            dialogInfo.push(panelInfo);
        });

        return dialogInfo;
    }

    private sortDialogsByZIndex(dialogs: Dialog[]): Dialog[] {
        return dialogs.sort((a, b) => {
            return a.getZIndex() - b.getZIndex()
        });
    }
}
