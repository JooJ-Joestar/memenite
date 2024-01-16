import * as BABYLON from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import * as Colyseus from "colyseus.js";
import { Level1 } from './maps/Level1';
import {Player} from './models/Player';
import { PlayerAttributes } from './types/PlayerAttributes';

//enum for states
enum State {
    START = 0,
    GAME = 1,
    LOSE = 2,
    CUTSCENE = 3
}

export const COLYSEUS_URL = 'ws://localhost:2567';

export class AppOne {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    state: number = 0;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas);

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

        this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    createScene () {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = this.scene;

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.ArcRotateCamera("Camera", 5.5, 1.0, 30, BABYLON.Vector3.Zero(), scene);
        camera.mode = camera.ORTHOGRAPHIC_CAMERA;
        const rect   = this.engine.getRenderingCanvasClientRect();
        const aspect = rect.height / rect.width;
        // In this example we'll set the distance based on the camera's radius.
        camera.orthoLeft   = -camera.radius;
        camera.orthoRight  =  camera.radius;
        camera.orthoBottom = -camera.radius * aspect;
        camera.orthoTop    =  camera.radius * aspect;
        // camera.attachControl(canvas, false);

        // // This targets the camera to scene origin
        // camera.setTarget(BABYLON.Vector3.Zero());

        // // This attaches the camera to the canvas
        // camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        // const light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 1, 0), scene);
        // const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        var level = new Level1(this.scene);
    }
}