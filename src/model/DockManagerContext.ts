import { DockManager } from "../DockManager";
import { Dialog } from "../floating/Dialog";
import { DocumentManagerContainer } from "../tabview/DocumentManagerContainer";
import { DockModel } from "./DockModel";


export class DockManagerContext {

    private model: DockModel;
    private documentManagerView: DocumentManagerContainer;

    constructor(private dockManager: DockManager) {
        this.model = new DockModel();
        this.documentManagerView = new DocumentManagerContainer(this.dockManager);
    }

    appendDialog(dialog: Dialog) {
        this.model.dialogs.push(dialog);
    }
}
