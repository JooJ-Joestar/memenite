import { Player } from '../models/Player';
import { PlayerInput } from '../models/PlayerInput';
import type {PlayerAttributes} from '../types/PlayerAttributes';

export class Level1 {
    private scene: BABYLON.Scene;
    private colliders: BABYLON.AbstractMesh[] = [];

    constructor (scene: BABYLON.Scene) {
        let _colliders: any = [];

        // The first parameter can be used to specify which mesh to import. Here we import all meshes
        BABYLON.SceneLoader.ImportMesh("", "/assets/maps/level-1/", "level-1.babylon", scene, function (newMeshes) {
            // Set the target of the camera to the first imported mesh
            // camera.target = newMeshes[0];
        });

        let import_mesh = BABYLON.SceneLoader.ImportMeshAsync("", "/assets/maps/level-1/", "level-1-colliders.babylon", scene, function (newMeshes) {
        });

        async function afterMeshIsImported (colliders: BABYLON.AbstractMesh[]) {
            const result = await import_mesh;
            for (let i in result.meshes) {
                if (result.meshes[i].name.indexOf("collider") == -1) return;

                // result.meshes[i].isVisible = false;
                result.meshes[i].isPickable = true;
                result.meshes[i].checkCollisions = true;
                colliders.push(result.meshes[i]);
            }
        }
        afterMeshIsImported(this.colliders);

        window.addEventListener("keydown", (ev) => {
            //Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'C') {
                for (let i in this.colliders) {
                    this.colliders[i].visibility = Math.abs(Math.abs(this.colliders[i].visibility) - 1);
                }
            }
        });

        var kek_options: PlayerAttributes = {
            mesh: {
                size: 1,
                width: 1,
                height: 1,
                depth: 1,
                faceColors: [
                    new BABYLON.Color4(1, 0, 0, 1),
                    new BABYLON.Color4(1, 0, 0, 1),
                    new BABYLON.Color4(1, 0, 0, 1),
                    new BABYLON.Color4(1, 0, 0, 1),
                    new BABYLON.Color4(1, 0, 0, 1),
                    new BABYLON.Color4(1, 0, 0, 1),
                ],
            },
            position: {
                x: -6.5,
                y: 0.5,
                z: 6.5
            }
        };

        var husband_options: PlayerAttributes = {
            mesh: {
                size: 1,
                width: 1,
                height: 1,
                depth: 1,
                faceColors: [
                    new BABYLON.Color4(0, 1, 0, 1),
                    new BABYLON.Color4(0, 1, 0, 1),
                    new BABYLON.Color4(0, 1, 0, 1),
                    new BABYLON.Color4(0, 1, 0, 1),
                    new BABYLON.Color4(0, 1, 0, 1),
                    new BABYLON.Color4(0, 1, 0, 1),
                ],
            },
            position: {
                x: 7.5,
                y: 0.5,
                z: -6.5
            }
        };

        var wife_options: PlayerAttributes = {
            mesh: {
                size: 1,
                width: 1,
                height: 1,
                depth: 1,
                faceColors: [
                    new BABYLON.Color4(0, 0, 1, 1),
                    new BABYLON.Color4(0, 0, 1, 1),
                    new BABYLON.Color4(0, 0, 1, 1),
                    new BABYLON.Color4(0, 0, 1, 1),
                    new BABYLON.Color4(0, 0, 1, 1),
                    new BABYLON.Color4(0, 0, 1, 1),
                ],
            },
            position: {
                x: 6.5,
                y: 0.5,
                z: -7.5
            }
        };

        const kek_input = new PlayerInput(scene);
        const kek = new Player("kek", kek_options, scene, kek_input);
        kek.activatePlayerCamera();
        // const husband = new Player("husband", husband_options, scene, );
        // const wife = new Player("wife", wife_options, scene, );

        this.scene = scene;
    }
}