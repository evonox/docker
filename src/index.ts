import "reflect-metadata"
import { DockManager } from "./facade/DockManager"
import { IPanelAPI } from "./common/panel-api";


const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("panel1", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "DockerTS Library";
            return domElement;
        }
    }
});

dockManager.createPanel("panel1").then(container => {
    dockManager.dockLeft(dockManager.getDocumentNode(), container, 0.4);
}).catch(err => {
    console.dir(err);
});
