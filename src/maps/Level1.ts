import * as BABYLON from "@babylonjs/core";
import * as Colyseus from "colyseus.js";
import { Player } from '../models/Player';
import { PlayerInput } from '../models/PlayerInput';
import type { PlayerAttributes } from '../types/PlayerAttributes';
import { COLYSEUS_URL } from '../AppOne';

export class Level1 {
    private scene: any;
    private colliders: BABYLON.AbstractMesh[] = [];
    public playerEntities: any = {};

    colyseusSDK: Colyseus.Client = new Colyseus.Client(COLYSEUS_URL);

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;

        // The first parameter can be used to specify which mesh to import. Here we import all meshes
        BABYLON.SceneLoader.ImportMesh("", "/assets/maps/level-1/", "level-1.babylon", scene, function (newMeshes) {
            // Set the target of the camera to the first imported mesh
            // camera.target = newMeshes[0];
        });

        let import_mesh = BABYLON.SceneLoader.ImportMeshAsync("", "/assets/maps/level-1/", "level-1-colliders.babylon", scene, function (newMeshes) {
        });

        async function afterMeshIsImported(colliders: BABYLON.AbstractMesh[]) {
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

        // TODO move this block of code somewhere else.
        this.colyseusSDK.joinOrCreate("my_room").then((room: any) => {
            let is_current_player = false;
            room.state.players.onAdd((player: any, sessionId: string) => {
                console.log("New player " + sessionId);
                is_current_player = sessionId === room.sessionId;

                player.listen("ready", () => {

                    this.playerEntities[sessionId] = Player.setCharacter(
                        room,
                        sessionId,
                        player,
                        player.character,
                        this.scene,
                        is_current_player
                    );

                    // room.state.players.forEach(element => {
                    //     console.log(element.session_id);
                    // })
                });

                this.playerEntities[sessionId].mesh_next_position = this.playerEntities[sessionId].mesh.position.clone();
                player.onChange(() => {
                    // Without interpolation
                    // this.playerEntities[sessionId].mesh.position.set(player.x, player.y, player.z);

                    // With interpolation
                    this.playerEntities[sessionId].mesh_next_position.set(player.x, player.y, player.z);
                });
            });

            room.onMessage("player_ready", (client: any) => {
                // TODO?
            });
        });

        this.scene.registerBeforeRender(() => {
            for (let session_id in this.playerEntities) {
                var entity = this.playerEntities[session_id].mesh;
                var targetPosition = this.playerEntities[session_id].mesh_next_position;
                entity.position = BABYLON.Vector3.Lerp(entity.position, targetPosition, 0.30);
            }
        });
    }
}