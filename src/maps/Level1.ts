import * as BABYLON from "@babylonjs/core";
import * as Colyseus from "colyseus.js";
import { COLYSEUS_URL } from '../BabylonApp';

export class Level1 {
    private scene: any;
    private engine: any;

    // We DO NOT need to save the colliders somewhere as Babylon.js will handle them automatically, but I wanted
    // a quick way of knowing which element was a collider so one can quickly hide them during debugging.
    private colliders: BABYLON.AbstractMesh[] = [];

    // Now THIS is required. We need to quickly know the properties of everyone connected.
    // This should probably be moved somewhere else, maybe even have a class of it's own.
    public playerEntities: any = {};
    public missile_entities: any = {};
    public missile_entities_no_collisions: any = {};

    private current_player_id: string = "";

    // Connects to the Colyseus backend.
    public colyseusSDK: Colyseus.Client = new Colyseus.Client(COLYSEUS_URL);

    constructor(
        scene?: BABYLON.Scene,
        engine?: any
    ) {
        // @ts-ignore
        this.scene = scene;
        this.engine = engine;

        let import_mesh = BABYLON.SceneLoader.ImportMeshAsync("", "/assets/maps/level-1/", "objetos-v2.babylon", scene, function (newMeshes) {
        });
        let import_throwables = BABYLON.SceneLoader.ImportMeshAsync("", "/assets/maps/level-1/", "throwables.babylon", scene, function (newMeshes) {
        });

        // This needs to run async, otherwise it will run before the mesh finishes importing.
        // Adds colliders to the colliders array.
        async function afterMeshIsImported(colliders: BABYLON.AbstractMesh[]) {
            const result = await import_mesh;
            for (let i in result.meshes) {
                if (result.meshes[i].name.indexOf("collider") == -1) continue;

                // Should be changed to true when not in dev mode.
                result.meshes[i].isVisible = false;
                result.meshes[i].isPickable = true;
                result.meshes[i].checkCollisions = true;
                colliders.push(result.meshes[i]);
            }
        }
        afterMeshIsImported(this.colliders);

        // Listens for SHIFT CTRL ALT C. When pressed, makes colliders invisible.
        // For debug purposes only. Disable when live.
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'C') {
                for (let i in this.colliders) {
                    this.colliders[i].visibility = Math.abs(Math.abs(this.colliders[i].visibility) - 1);
                }
            }
        });

        return this;
    }
}