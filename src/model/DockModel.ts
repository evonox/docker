import { Dialog } from "../floating/Dialog";
import { DockNode } from "./DockNode";


export class DockModel {

    private _rootNode: DockNode;
    private _documentManagerNode: DockNode;
    private _dialogs: Dialog[] = [];

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
