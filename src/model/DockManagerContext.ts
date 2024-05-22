import { DockManager } from "../facade/DockManager";
import { Dialog } from "../floating/Dialog";
import { DocumentManagerContainer } from "../containers/DocumentManagerContainer";
import { DockModel } from "./DockModel";


export class DockManagerContext {

    private _model: DockModel;
    private _documentManagerView: DocumentManagerContainer;

    constructor(private dockManager: DockManager) {
        this._model = new DockModel();
        this._documentManagerView = new DocumentManagerContainer(this.dockManager);
    }

    setModel(model: DockModel) {
        this._model = model;
    }

    get model() {
        return this._model;
    }

    get documentManagerView() {
        return this._documentManagerView;
    }

    appendDialog(dialog: Dialog) {
        this._model.dialogs.push(dialog);
    }
}
