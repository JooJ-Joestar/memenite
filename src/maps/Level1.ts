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
        let _colliders: any = [];

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


        // const kek_input = new PlayerInput(scene);
        // const kek = new Player("kek", kek_options, scene, kek_input);
        // kek.activatePlayerCamera();
        // const husband = new Player("husband", husband_options, scene, );
        // const wife = new Player("wife", wife_options, scene, );

        this.scene = scene;
        this.colyseusSDK.joinOrCreate("my_room").then((room: any) => {
            // listen for new players
            let new_player_session_id: string = "";
            let new_player: any = null;
            let is_current_player = false;
            room.state.players.onAdd((player: any, sessionId: string) => {
                is_current_player = sessionId === room.sessionId;
                // this.playerEntities[sessionId] = player;

                // console.log(room.state.players.entries());
                // room.state.players.forEach(element => {
                //     console.log(element);
                // })
                new_player_session_id = sessionId;
                new_player = player;
            });

            room.onMessage("player_ready", (client: any, data: any) => {
                this.playerEntities[new_player_session_id] = Player.setCharacter(
                    new_player_session_id,
                    new_player,
                    client.character,
                    this.scene,
                    is_current_player
                );
                // console.log(this.playerEntities[new_player_session_id]);
                this.playerEntities[new_player_session_id].mesh.position.set(client.position.x, client.position.y, client.position.z);
                // new_player.onChange(() => {
                //     this.playerEntities[new_player_session_id].position.set(player.x, player.y, player.z);
                // });
            });
        });
    }
}