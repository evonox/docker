import "reflect-metadata"
import { DockManager } from "./facade/DockManager"

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
        },
        getMinHeight: () => 125
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
        },
        getMinWidth: () => 500
    }
});

dockManager.registerPanelType("panel3", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "DockerTS Panel Three";
            api.setPanelFAIcon("fa fa-hamburger");
            api.setPanelTitle("Panel Number 3");
            return domElement;
        }
    }
});

dockManager.registerPanelType("panel4", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "Docked Left";
            api.setPanelFAIcon("fa fa-cross");
            api.setPanelTitle("Left View");
            return domElement;
        },
        getMinWidth: () => 200
    }
});

dockManager.registerPanelType("panel5", "panel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "Docked Bottom";
            api.setPanelFAIcon("fa fa-cross");
            api.setPanelTitle("Bottom View");
            return domElement;
        },
        getMinHeight: () => 100
    }
});


async function performDocking() {

    try {
        const containerOne = await dockManager.createPanel("panel1");
        const containerTwo = await dockManager.createPanel("panel2");
        const containerThree = await dockManager.createPanel("panel3");
        const containerLeft = await dockManager.createPanel("panel4");
        const containerBottom = await dockManager.createPanel("panel5");

        dockManager.dockFill(dockManager.getDocumentNode(), containerOne);
        dockManager.dockFill(dockManager.getDocumentNode(), containerTwo);
        dockManager.dockFill(dockManager.getDocumentNode(), containerThree);
        dockManager.dockLeft(dockManager.getDocumentNode(), containerLeft, 0.3);
        dockManager.dockDown(dockManager.getDocumentNode(), containerBottom, 0.25);
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();


