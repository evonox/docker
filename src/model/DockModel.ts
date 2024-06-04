import { Dialog } from "../floating/Dialog";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DockNode } from "./DockNode";


export class DockModel {

    private _rootNode: DockNode;
    private _documentManagerNode: DockNode;
    private _dialogs: Dialog[] = [];

    setRootNode(node: DockNode) {
        this._rootNode = node;
    }

    setDocumentManagerNode(node: DockNode) {
        this._documentManagerNode = node;
    }

    isLastDialog(dialog: Dialog): boolean {
        return ArrayUtils.lastElement(this._dialogs) === dialog;
    }

    moveDialogToEnd(dialog: Dialog) {
        ArrayUtils.removeItem(this._dialogs, dialog);
        this._dialogs.push(dialog);
    }

    get rootNode() {
        return this._rootNode;
    }

    get dialogs() {
        return this._dialogs;
    }

    get documentManagerNode() {
        return this._documentManagerNode;
    }
}
