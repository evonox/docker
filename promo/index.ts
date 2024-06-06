import { IPanelStateAPI } from "../src/common/panel-api";
import { DockManager } from "../src/facade/DockManager"
import "../src/index.css";

import "primereact/resources/themes/lara-light-cyan/theme.css";


// import { initBabylonDemo } from "./babylon-demo";
import { startBabylonDemo } from "./babylon-engine";
import { createDemoScene } from "./demo-scene";
import { CreditsFactoryFn } from "./panels/CreditsPanel";
import { DockModelViewFactoryFn } from "./panels/DockModelView";
import { BarChartFactoryFn, DoughnutChartFactoryFn, LineChartFactoryFn, PieChartFactoryFn, StackedChartFactoryFn } from "./panels/chart-panels";
import { createVillageScene } from "./village-demo";

declare var ace: any;

const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("babylonJS", "singleton", (dockManager) => {

    return {
        initialize: async (api, options) => {
            api.setPanelFAIcon("fa-brands fa-unity");
            api.setPanelTitle("BabylonJS 3D Engine Demo");

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

dockManager.registerPanelType("creditsView", "singleton", CreditsFactoryFn);

dockManager.registerPanelType("dockModelView", "singleton", DockModelViewFactoryFn);

dockManager.registerPanelType("aceEditor", "transient", (dockManager) => {

    return {
        initialize: async (api, options) => {
            const documentTitle = options.getValue("title");
            const documentMode = options.getValue("mode");
            const documentUrl = options.getValue("url");

            api.setPanelFAIcon("fa fa-file");
            api.setPanelTitle(documentTitle);

            const domRootElement = document.createElement("div");
            domRootElement.style.display = "block";
            domRootElement.style.height = "100%";
    
            try {
                ace.config.set("loadWorkerFromBlob", false);
                var editor = ace.edit(domRootElement);
                editor.setTheme("ace/theme/theme");
                editor.session.setMode(`ace/mode/${documentMode}`);               

                window.fetch(documentUrl).then(respose => respose.text().then(content => {
                    editor.session.setValue(content);
                }));
            }
            catch {}
            finally {
                return domRootElement;
            }

        }
    }
});

dockManager.registerTabbedPanelType("chartView", "singleton", () => {
    return {
        initialize: async (api) => {
            api.setPanelTitle("Chart View");
            api.setPanelFAIcon("fa-solid fa-chart-simple")
        }
    }
});

dockManager.registerPanelType("barChart", "singleton", BarChartFactoryFn);
dockManager.registerPanelType("pieChart", "singleton", PieChartFactoryFn);
dockManager.registerPanelType("doughnutChart", "singleton", DoughnutChartFactoryFn);
dockManager.registerPanelType("stackedChart", "singleton", StackedChartFactoryFn);
dockManager.registerPanelType("lineChart", "singleton", LineChartFactoryFn);


async function performDocking() {

    try {
        const babylonJSPanel = await dockManager.createPanel("babylonJS");
        const creditsPanel = await dockManager.createPanel("creditsView");
        const dockModelPanel = await dockManager.createPanel("dockModelView");

        // Create TabbedPanelContainer for Charts
        const chartView = await dockManager.createTabbedPanel("chartView");
        const barChart = await dockManager.createPanel("barChart");
        const pieChart = await dockManager.createPanel("pieChart");
        const doughnutChart = await dockManager.createPanel("doughnutChart");
        const stackedChart = await dockManager.createPanel("stackedChart");
        const lineChart = await dockManager.createPanel("lineChart");
        chartView.addContainer(barChart);
        chartView.addContainer(pieChart);
        chartView.addContainer(doughnutChart);
        chartView.addContainer(stackedChart);
        chartView.addContainer(lineChart);

        // Construct Code Editors
        const pythonEditor = await dockManager.createPanel("aceEditor", {
            title: "Python Editor",
            mode: "python",
            url: "/code/example.py"
        });
        const javascriptEditor = await dockManager.createPanel("aceEditor", {
            title: "JavaScript Editor",
            mode: "javascript",
            url: "/code/example.js"
        });
        const typescriptEditor = await dockManager.createPanel("aceEditor", {
            title: "TypeScript Editor",
            mode: "typescript",
            url: "/code/example.ts"
        });
        const javaEditor = await dockManager.createPanel("aceEditor", {
            title: "Java Editor",
            mode: "java",
            url: "/code/example.java"
        });


        dockManager.setActivePanel(babylonJSPanel);

        const documentNode = dockManager.getDocumentNode();
        dockManager.dockFill(documentNode, pythonEditor);
        dockManager.dockFill(documentNode, javascriptEditor);
        dockManager.dockFill(documentNode, typescriptEditor);
        dockManager.dockFill(documentNode, javaEditor);
        dockManager.dockLeft(documentNode, babylonJSPanel, 0.4);
        const nodeCredits = dockManager.dockDown(documentNode, creditsPanel, 0.35);
        dockManager.dockFill(nodeCredits, chartView);
        dockManager.dockRight(documentNode, dockModelPanel, 0.28);
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();

