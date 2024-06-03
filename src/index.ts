import { DockManager } from "./facade/DockManager"

import "./index.css";
import { IPanelAPI, IPanelStateAPI } from "./common/panel-api";
import { DOM } from "./utils/DOM";

const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("panel1", "singleton", (dockManager) => {

    let panelApi: IPanelStateAPI;

    return {
        initialize: async (api, options) => {
            panelApi = api;
            api.addHeaderButton({
                displayOrder: 1000,
                icon: `<i class="fa fa-plus"></i>`,
                title: "Add document",
                actionName: "AddDocument",
                visible: true
            });
            api.showHeaderButton("AddDocument", false);
            api.removeHeaderButton("AddDocument");
            
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
            if(actionName === "Action One") {
                panelApi.channel().notify("Focus");
            } else if(actionName === "Action2") {
                panelApi.channel("CHANNEL").notify("Focus");
            }
            console.log(`ACTION INVOKED: ${actionName}`);
        }

    }
});

dockManager.registerPanelType("panel2", "singleton", (dockManager) => {
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
            api.channel().subscribe("Focus", () => api.activate());
            return domElement;
        },
        getMinWidth: () => 500,
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                icon: `<i class="fa fa-bars"></i>`,
                title: "Menu Item One",
                actionName: "Action One"            
            });   
        }
    }
});

dockManager.registerPanelType("panel3", "transient", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "DockerTS Panel Three " + options.getValue("key");
            api.setPanelFAIcon("fa fa-hamburger");
            api.setPanelTitle("Panel Number 3 - " + options.getValue("key"));
            return domElement;
        },
        onQueryContextMenu:  (contextMenu) => {
            contextMenu.appendMenuItem({
                displayOrder: 1,
                title: "Hamburger Menu",
                icon: `<i class="fa fa-hamburger"></i>`,
                actionName: "Ham"
            })
        },
    }
});

dockManager.registerPanelType("panel4", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "Docked Left";
            api.setPanelFAIcon("fa fa-cross");
            api.setPanelTitle("Left View");
            api.channel("CHANNEL").subscribe("Focus", () => api.activate());
            return domElement;
        },
        getMinWidth: () => 100,
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

dockManager.registerPanelType("panel5", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "Docked Bottom";
            api.setPanelFAIcon("fa fa-cross");
            api.setPanelTitle("Bottom View");
            return domElement;
        },
        getMinWidth: () => 300,
        getMinHeight: () => 150,
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

dockManager.registerPanelType("panel6", "transient", (dockManager) => {
    return {
        initialize: async (api, options) => {
            const domElement = document.createElement("h1");
            domElement.innerText = "FLOATING DIALOG: " + options.getValue("key");
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

dockManager.registerTabbedPanelType("tabbedPanel", "singleton", (dockManager) => {
    return {
        initialize: async (api, options) => {
            api.setPanelFAIcon("fa fa-plus");
            api.setPanelTitle("Tabbed View");
        },
        onQueryContextMenu: (config) => {
            config.appendMenuItem({
                displayOrder: 1,
                title: "Tabbed Stuff",
                actionName: "TAbbed"
            })
        }
    }
});

async function performDocking() {

    try {
        const containerOne = await dockManager.createPanel("panel1");
        const containerTwo = await dockManager.createPanel("panel2");

        const containerThree = await dockManager.createPanel("panel3", {key: "1"});
        const containerThree1 = await dockManager.createPanel("panel3", {key: "2"});
        const containerThree2 = await dockManager.createPanel("panel3", {key: "3"});
        const containerThree3 = await dockManager.createPanel("panel3", {key: "4"});
        const containerLeft = await dockManager.createPanel("panel4");
        const containerBottom = await dockManager.createPanel("panel5");
        const containerFloat = await dockManager.createPanel("panel6", {key: "BOTTOM"});
        const containerFloat2 = await dockManager.createPanel("panel6", {key: "FLOATING"});
        const tabbedContainer = await dockManager.createTabbedPanel("tabbedPanel");
        tabbedContainer.addContainer(containerThree1);
        tabbedContainer.addContainer(containerThree2);
        tabbedContainer.addContainer(containerThree3);


        dockManager.dockFill(dockManager.getDocumentNode(), containerOne);
        dockManager.dockFill(dockManager.getDocumentNode(), containerTwo);
        dockManager.dockFill(dockManager.getDocumentNode(), containerThree);
        dockManager.dockFill(dockManager.getDocumentNode(), tabbedContainer);
        const dockLeftNode = dockManager.dockLeft(dockManager.getDocumentNode(), containerLeft, 0.3);
        dockManager.setActivePanel(containerOne);
        dockManager.dockFill(dockLeftNode, containerBottom);
        const node = dockManager.dockDown(dockManager.getDocumentNode(), containerFloat, 0.4);
        dockManager.dockFill(node, containerFloat2);

        // dockManager.floatDialog(containerFloat2, {x: 50, y: 50, w: 500, h: 200});
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();


