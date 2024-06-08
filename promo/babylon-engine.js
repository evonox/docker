import { EventHelper } from "../src/utils/event-helper";

const FPS = 120;

export async function startBabylonDemo(canvas, createScene) {

    var engine;
    var scene;

    var renderScene = function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    }

    var renderSceneDebounced = EventHelper.throttle(renderScene, 1000 / FPS, { leading: true, trailing: true });

    var startRenderLoop = function (engine, canvas) {
        engine.runRenderLoop(function () {
            setTimeout(() => {
                renderScene();
            });
        });
    }

    var sceneToRender = null;
    var createDefaultEngine = function () {
        return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
    };

    var initFunction = async function () {

        var asyncEngineCreation = async function () {
            try {
                return createDefaultEngine();
            } catch (e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                return createDefaultEngine();
            }
        }

        engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        scene = createScene(engine, canvas);
    };

    initFunction().then(() => {
        scene.then(returnedScene => { sceneToRender = returnedScene; });

    });

    const resizeEngine = EventHelper.throttle(() => {
        engine.resize();
        sceneToRender.render();
    }, 1000 / FPS, { leading: true, trailing: true });

    var resizeObserver = new ResizeObserver(() => {
        resizeEngine();
    });
    resizeObserver.observe(canvas, { box: "border-box" });
}
