import { IPanelStateAPI } from "../src/common/panel-api";
import { DockManager } from "../src/facade/DockManager"
import "../src/index.css";

// import { initBabylonDemo } from "./babylon-demo";
import { startBabylonDemo } from "./babylon-engine";
import { createDemoScene } from "./demo-scene";
import { createVillageScene } from "./village-demo";

declare var ace: any;

const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("babylonJS", "singleton", (dockManager) => {

    return {
        initialize: async (api, options) => {
            api.setPanelFAIcon("fa-brands fa-unity");
            api.setPanelTitle("BabylonJS Demo");

            const domRootElement = document.createElement("div");
            domRootElement.style.overflow = "hidden";
            const domCanvas = document.createElement("canvas");
            domRootElement.appendChild(domCanvas);            
            domRootElement.classList.add("renderCanvas")
            domCanvas.classList.add("canvasZone");

            startBabylonDemo(domCanvas, createVillageScene)
            return domRootElement;
        }
    }
});

dockManager.registerPanelType("aceEditor", "transient", (dockManager) => {

    return {
        initialize: async (api, options) => {
            const documentTitle = options.getValue("title");
            const documentMode = options.getValue("mode");

            api.setPanelFAIcon("fa fa-file");
            api.setPanelTitle(documentTitle);

            const domRootElement = document.createElement("div");
            domRootElement.style.display = "block";
            domRootElement.style.height = "100%";
    
            try {
                var editor = ace.edit(domRootElement);
                editor.setTheme("ace/theme/theme");
                editor.session.setMode(`ace/mode/${documentMode}`);               
            }
            catch {}
            finally {
                return domRootElement;
            }

        }
    }
});


async function performDocking() {

    try {
        const babylonJSPanel = await dockManager.createPanel("babylonJS");

        // Construct Code Editors
        const pythonEditor = await dockManager.createPanel("aceEditor", {
            title: "Python Editor",
            mode: "python"
        });
        const javascriptEditor = await dockManager.createPanel("aceEditor", {
            title: "JavaScript Editor",
            mode: "javascript"
        });
        const typescriptEditor = await dockManager.createPanel("aceEditor", {
            title: "TypeScript Editor",
            mode: "typescript"
        });
        const javaEditor = await dockManager.createPanel("aceEditor", {
            title: "Java Editor",
            mode: "java"
        });


        dockManager.setActivePanel(babylonJSPanel);

        const documentNode = dockManager.getDocumentNode();
        dockManager.dockFill(documentNode, pythonEditor);
        dockManager.dockFill(documentNode, javascriptEditor);
        dockManager.dockFill(documentNode, typescriptEditor);
        dockManager.dockFill(documentNode, javaEditor);
        dockManager.dockLeft(documentNode, babylonJSPanel, 0.4);

        // dockManager.floatDialog(babylonJSPanel, {
        //     x: 200, y: 50, w: 500, h: 300
        // });
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();

