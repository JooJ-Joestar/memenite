import * as BABYLON from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import * as Colyseus from "colyseus.js";
import { Level1 } from './maps/Level1';
import {Player} from './models/Player';
import { PlayerAttributes } from './types/PlayerAttributes';

//enum for states
// Not used for now.
enum State {
    START = 0,
    GAME = 1,
    LOSE = 2,
    CUTSCENE = 3
}

// Colyseus URL for multiplayer connection.
export const COLYSEUS_URL = 'ws://localhost:2567';

export class AppOne {
    // Takes care of running things I guess.
    engine: BABYLON.Engine;

    // Takes care of taking care of things. Everything related to what is happening in your screen
    // is thanks to this scene thing.
    // You will have to parse this thing along to classes, functions and variables almost all the time
    // so whatever is computed is registered in here and shown in the screen.
    scene: BABYLON.Scene;

    // Not used for now.
    state: number = 0;
    readonly canvas: HTMLCanvasElement;

    constructor(readonly canvas_element: HTMLCanvasElement) {
        // It appears to be useless to save the canvas to a property, but I'm doing so just in case.
        this.canvas = canvas_element;
        this.engine = new BABYLON.Engine(this.canvas);

        this.scene = new BABYLON.Scene(this.engine);
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.createScene()
    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            Inspector.Show(this.scene, {overlay: true});
        } else {
            Inspector.Hide();
        }
    }

    run() {
        //**for development: make inspector visible/invisible
        window.addEventListener("keydown", (ev) => {
            //Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'D') {
                if (this.scene.debugLayer.isVisible()) {
                    this.debug(false);
                } else {
                    this.debug();
                }
            }
        });

        // Starts overlay debugger as default.
        this.debug();

        // Game engine loop that will render each frame.
        // I have little idea on how this works but don't worry about it.
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    createScene () {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = this.scene;

        // This creates and positions a free camera (non-mesh)
        // Yeah, bunch of stuff regarding the camera. Mess around to figure stuff out or look at the docs, I have no idea
        // how to explain these.
        var camera = new BABYLON.ArcRotateCamera("Camera", 5.5, 1.0, 30, BABYLON.Vector3.Zero(), scene);
        camera.mode = BABYLON.ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
        const rect: any = this.engine.getRenderingCanvasClientRect();
        const aspect = rect.height / rect.width;
        // In this example we'll set the distance based on the camera's radius.
        // Will we? I don't remember. Anyways, just use the debugger to find a cool placement for the camera.
        camera.orthoLeft   = -camera.radius;
        camera.orthoRight  =  camera.radius;
        camera.orthoBottom = -camera.radius * aspect;
        camera.orthoTop    =  camera.radius * aspect;
        // The code below allows you to use your mouse and arrows to control the camera.
        // camera.attachControl(this.canvas, false);

        // // This targets the camera to scene origin
        // camera.setTarget(BABYLON.Vector3.Zero());

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // Yeah, lights are good.
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        // const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 1, 0), scene);
        // const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // After the very basics are ready, we will load the level.
        // Please note that there is a lot of dumb stuff in Level1 right now. I should refactor it ASAP.
        // Or leave it there for the game jam, it's not like it's that dumb anyways.
        //
        // Also, remember what I mentioned about having to parse the scene property everywhere? The ride starts here.
        var level = new Level1(this.scene);

        // We don't have to deal with anything else here unless we want to.
    }
}