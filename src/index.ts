import "reflect-metadata"
import { DockManager } from "./facade/DockManager"
import { IPanelAPI } from "./common/panel-api";

import "./index.css";

const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("panel1", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "DockerTS Panel One";
            api.setPanelFAIcon("fa fa-user");
            api.setPanelTitle("Panel Number 1");
            return domElement;
        }
    }
});

dockManager.registerPanelType("panel2", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "DockerTS Panel Two";
            setTimeout(() => {
                api.setPanelTitle("Hello world");
                setTimeout(() => {
                    api.setPanelFAIcon("fa fa-file");
                    setTimeout(() => {
                        api.notifyHasChanges(true);
                    }, 2500);
                }, 1500);
            }, 3000);
            return domElement;
        }
    }
});

async function performDocking() {

    try {
        const containerOne = await dockManager.createPanel("panel1");
        const containerTwo = await dockManager.createPanel("panel2");
        dockManager.dockFill(dockManager.getDocumentNode(), containerOne);
        dockManager.dockFill(dockManager.getDocumentNode(), containerTwo);
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();


