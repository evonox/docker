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
        getMinHeight: () => 125,
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                icon: `<i class="fa fa-bars"></i>`,
                title: "Menu Item One",
                actionName: "Action One"            
            });   
            config.appendMenuItem({displayOrder: 50, separator: true});
            config.appendMenuItem({displayOrder: 101, title: "Menu Item Two", actionName: "Action2"});
            config.appendMenuItem({displayOrder: 102, title: "Menu Item Three", actionName: "Action3"});
        },
        onActionInvoked: (actionName) => {
            console.log(`ACTION INVOKED: ${actionName}`);
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
        getMinWidth: () => 200,
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                icon: `<i class="fa fa-user"></i>`,
                title: "Menu Item One",
                actionName: "Action One"            
            });
    
            config.appendMenuItem({displayOrder: 100, separator: true});
            config.appendMenuItem({displayOrder: 101, title: "Menu Item 2", actionName: "Action2"});
            config.appendMenuItem({displayOrder: 102, title: "Menu Item 3", actionName: "Action3"});
        },
        onActionInvoked: (actionName) => {
            console.log(`ACTION INVOKED: ${actionName}`);
        }
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
        getMinHeight: () => 100,
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                icon: `<i class="fa fa-hamburger"></i>`,
                title: "Menu Item One",
                actionName: "Action One"            
            });   
            config.appendMenuItem({displayOrder: 101, title: "Menu Item 2", actionName: "Action2"});
            config.appendMenuItem({displayOrder: 102, title: "Menu Item 3", actionName: "Action3"});
        },
        onActionInvoked: (actionName) => {
            console.log(`ACTION INVOKED: ${actionName}`);
        }

    }
});

dockManager.registerPanelType("panel6", "panel", "transient", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "FLOATING DIALOG";
            api.setPanelFAIcon("fa fa-bars");
            api.setPanelTitle("Floating Test Dialog");
            return domElement;
        },
        getMinWidth: () => 400,
        getMinHeight: () => 100,
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                icon: `<i class="fa fa-bars"></i>`,
                title: "Menu Item One",
                actionName: "Action One"            
            });   
            config.appendMenuItem({displayOrder: 50, separator: true});
            config.appendMenuItem({displayOrder: 101, title: "Menu Item Two", actionName: "Action2"});
            config.appendMenuItem({displayOrder: 102, title: "Menu Item Three", actionName: "Action3"});
        },
        onActionInvoked: (actionName) => {
            console.log(`ACTION INVOKED: ${actionName}`);
        }

    }
});

async function performDocking() {

    try {
        const containerOne = await dockManager.createPanel("panel1");
        // const containerTwo = await dockManager.createPanel("panel2");
        // const containerThree = await dockManager.createPanel("panel3");
        // const containerLeft = await dockManager.createPanel("panel4");
        // const containerBottom = await dockManager.createPanel("panel5");
        // const containerFloat = await dockManager.createPanel("panel6");

        dockManager.dockFill(dockManager.getDocumentNode(), containerOne);
        dockManager.setActivePanel(containerOne);
        // dockManager.dockFill(dockManager.getDocumentNode(), containerTwo);
        // dockManager.dockFill(dockManager.getDocumentNode(), containerThree);
        // dockManager.dockLeft(dockManager.getDocumentNode(), containerLeft, 0.3);
        // dockManager.dockDown(dockManager.getDocumentNode(), containerBottom, 0.25);

        // dockManager.floatDialog(containerFloat, {x: 50, y: 50, w: 500, h: 200});
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();


