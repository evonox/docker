import _ from "lodash-es";

export async function initBabylonDemo(canvas) {

    var engine = null;
    var scene = null;
    let leftBtn;
    let rightBtn;


    var renderScene = function() {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    }

    var renderSceneDebounced = _.throttle(renderScene, 1000 / 1000);

    var startRenderLoop = function (engine, canvas) {
        engine.runRenderLoop(function () {
            renderSceneDebounced();
        });
    }

    var sceneToRender = null;
    var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
    var createScene = async function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("camera1", -0.8, 1.2, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.wheelPrecision = 100;
    camera.inertia = 0.97;

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    var gs;
    var index = 0;
    const loadGS = async function () {
        gs?.dispose();
        gs = new BABYLON.GaussianSplattingMesh("gs", null, scene);

        const scenes = ["https://assets.babylonjs.com/splats/gs_Sqwakers_trimed.splat",
            "https://assets.babylonjs.com/splats/gs_Skull.splat",
            "https://assets.babylonjs.com/splats/gs_Plants.splat",
            "https://assets.babylonjs.com/splats/gs_Fire_Pit.splat"];
        const cameraRadii = [5, 5, 7, 9];
        const cameraAlphas = [-0.8, 2.9, -0.9, 0.8];
        await gs.loadFileAsync(scenes[index]);
        camera.radius = cameraRadii[index];
        camera.alpha = cameraAlphas[index];
    };

    await loadGS();

    // GUI
    var guiLayer = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("guiLayer");
    var guiContainer = new BABYLON.GUI.Grid();
    guiContainer.name = "uiGrid";
    guiContainer.addRowDefinition(1, false);
    guiContainer.addColumnDefinition(1 / 3, false);
    guiContainer.addColumnDefinition(1 / 3, false);
    guiContainer.addColumnDefinition(1 / 3, false);
    guiContainer.paddingTop = "50px";
    guiContainer.paddingLeft = "50px";
    guiContainer.paddingRight = "50px";
    guiContainer.paddingBottom = "50px";
    guiLayer.addControl(guiContainer);

    leftBtn = BABYLON.GUI.Button.CreateImageOnlyButton("left", "https://models.babylonjs.com/Demos/weaponsDemo/textures/leftButton.png");
    leftBtn.width = "55px";
    leftBtn.height = "55px";
    leftBtn.thickness = 0;
    leftBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftBtn.onPointerClickObservable.add(() => {
        index += 3;
        index %= 4;
        loadGS();
    });

    rightBtn = BABYLON.GUI.Button.CreateImageOnlyButton("right", "https://models.babylonjs.com/Demos/weaponsDemo/textures/rightButton.png");
    rightBtn.width = "55px";
    rightBtn.height = "55px";
    rightBtn.thickness = 0;
    rightBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightBtn.onPointerClickObservable.add(() => {
        index++;
        index %= 4;
        loadGS();
    });

    // add button to GUI
    guiContainer.addControl(leftBtn, 0, 0);
    guiContainer.addControl(rightBtn, 0, 2);

    // display loading screen while loading assets
    engine.displayLoadingUI();
    scene.executeWhenReady(function () {
        engine.hideLoadingUI();
    });
    scene.onBeforeRenderObservable.add(() => {
        camera.beta = Math.min(camera.beta, 1.45);
        camera.radius = Math.max(camera.radius, 3.);
        camera.radius = Math.min(camera.radius, 6.);
    });
    return scene;
};

    var initFunction = async function() {
                    
                    
                    
        var asyncEngineCreation = async function() {
            try {
            return createDefaultEngine();
            } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
            }
        }

        engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        scene = createScene();};
    initFunction().then(() => {scene.then(returnedScene => { sceneToRender = returnedScene; });
                        
    });

    const resizeEngine = _.throttle(() => {
        engine.resize();
    }, 1000 / 30, {leading: true, trailing: true});

    var resizeObserver = new ResizeObserver(() => {
        requestIdleCallback(() => {
            resizeEngine();
        })
    });
    resizeObserver.observe(canvas, {box: "border-box"});
}
