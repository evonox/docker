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
import { DebugHelper } from "../src/utils/DebugHelper";
import { NotificationFactoryFn } from "./panels/notification-view";

declare var ace: any;

DebugHelper.enableOptimizations(false);


const dockManager = new DockManager(document.getElementById("main"));
dockManager.initialize();

dockManager.registerPanelType("babylonJS", "singleton", (dockManager) => {

    return {
        initialize: async (api, options) => {
            api.setPanelFAIcon("fa-brands fa-unity");
            api.setPanelTitle("BabylonJS 3D Engine Demo");
            api.enableProgressLoader(true);

            return new Promise<HTMLElement>(async (resolve, reject) => {
                const domRootElement = document.createElement("div");
                domRootElement.style.overflow = "hidden";
                const domCanvas = document.createElement("canvas");
                domRootElement.appendChild(domCanvas);            
                domRootElement.classList.add("renderCanvas")
                domCanvas.classList.add("canvasZone");
                await startBabylonDemo(domCanvas, createVillageScene)
                setTimeout(() => {
                    api.enableProgressLoader(false);
                    resolve(domRootElement);
                }, 2 * 1000);
            })
        }
    }
});

dockManager.registerPanelType("creditsView", "singleton", CreditsFactoryFn);

dockManager.registerPanelType("notificationView", "singleton", NotificationFactoryFn);


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
        const babylonJSPanel = dockManager.createPanel("babylonJS");
        const creditsPanel = dockManager.createPanel("creditsView");
        const dockModelPanel = dockManager.createPanel("dockModelView");
        const notificationPanel = await dockManager.createPanelAsync("notificationView");

        // Create TabbedPanelContainer for Charts
        const chartView = await dockManager.createTabbedPanelAsync("chartView");
        const barChart = await dockManager.createPanelAsync("barChart");
        const pieChart = await dockManager.createPanelAsync("pieChart");
        const doughnutChart = await dockManager.createPanelAsync("doughnutChart");
        const stackedChart = await dockManager.createPanelAsync("stackedChart");
        const lineChart = await dockManager.createPanelAsync("lineChart");
        chartView.addContainer(barChart);
        chartView.addContainer(pieChart);
        chartView.addContainer(doughnutChart);
        chartView.addContainer(stackedChart);
        chartView.addContainer(lineChart);

        // Construct Code Editors
        const pythonEditor = dockManager.createPanel("aceEditor", {
            title: "Python Editor",
            mode: "python",
            url: "/code/example.py"
        });
        const javascriptEditor = dockManager.createPanel("aceEditor", {
            title: "JavaScript Editor",
            mode: "javascript",
            url: "/code/example.js"
        });
        const typescriptEditor = dockManager.createPanel("aceEditor", {
            title: "TypeScript Editor",
            mode: "typescript",
            url: "/code/example.ts"
        });
        const javaEditor = dockManager.createPanel("aceEditor", {
            title: "Java Editor",
            mode: "java",
            url: "/code/example.java"
        });



        const documentNode = dockManager.getDocumentNode();
        dockManager.dockFill(documentNode, pythonEditor);
        dockManager.dockFill(documentNode, javascriptEditor);
        dockManager.dockFill(documentNode, typescriptEditor);
        dockManager.dockFill(documentNode, javaEditor);
        dockManager.dockLeft(documentNode, babylonJSPanel, 0.35);
        const nodeCredits = dockManager.dockDown(documentNode, creditsPanel, 0.35);
        dockManager.dockFill(nodeCredits, chartView);
        dockManager.dockFill(nodeCredits, notificationPanel);
        dockManager.dockRight(documentNode, dockModelPanel, 0.45);
        dockManager.setActivePanel(chartView);

        dockManager.setActivePanel(babylonJSPanel);
    }
    catch(err) {
        console.dir(err);
    }
}

performDocking();

