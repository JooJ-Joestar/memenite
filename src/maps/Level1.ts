import * as BABYLON from "@babylonjs/core";
import * as Colyseus from "colyseus.js";
import { Player } from '../models/Player';
import { PlayerInput } from '../models/PlayerInput';
import type { PlayerAttributes } from '../types/PlayerAttributes';
import { COLYSEUS_URL } from '../AppOne';
import { Hud } from "../models/Hud";
import { Missile } from "../models/Missile";
import { available_weapons } from "../attributes/AvailableWeapons";

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

        let import_mesh = BABYLON.SceneLoader.ImportMeshAsync("", "/assets/maps/level-1/", "final.babylon", scene, function (newMeshes) {
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
                // result.meshes[i].isVisible = false;
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

        // TODO move this block of code somewhere else.
        // As I said, this is ugly.
        // Despite its ugliness, this is where the fun begins. :)
        // Connects to Colyseus and then performs some stuff.
        this.colyseusSDK.joinOrCreate("my_room").then((room: any) => {
            let is_current_player = false;

            // After receiving backend confirmation of a player connecting, performs the function.
            // player holds player info (duh), sessionId holds the connection ID for the websocket.
            room.state.players.onAdd((player: any, sessionId: string) => {
                console.log("New player " + sessionId);
                // Might be dumb to think about it, but your own connections passes here too. So you have to check for it.
                is_current_player = sessionId === room.sessionId;
                if (is_current_player === true) {
                    this.current_player_id = sessionId;
                }

                player.listen("ready", () => {
                    // There is a bug going on where the ready confirmation is sent twice, so here all you have to do is
                    // check if the player entity for that sessionId already exists. If so, do nothing.
                    if (this.playerEntities[sessionId]) return;

                    // Creates the player model.
                    this.playerEntities[sessionId] = new Player(
                        room,
                        this.scene,
                        sessionId,
                        player,
                        is_current_player,
                        player.character,
                        player.nickname,
                        this.engine
                    );
                });

                // This is part of what is responsible for smoothing player movement, and is one of the things that should be moved
                // somewhere else. Perhaps Player.
                this.playerEntities[sessionId].mesh_next_position = this.playerEntities[sessionId].mesh.position.clone();
                player.onChange(() => {
                    // With interpolation
                    this.playerEntities[sessionId].check_animation(player.x_movement, player.z_movement);
                    this.playerEntities[sessionId].mesh_next_position.set(player.x, player.y, player.z);
                    this.playerEntities[sessionId].sprite.position.set(player.x, player.y + 1.25, player.z);

                    // Without interpolation
                    // this.playerEntities[sessionId].mesh.position.set(player.x, player.y, player.z);

                });
            });

            room.onMessage("timer", (client: any) => {
                let ui = this.scene.getTextureByName("UI");
                let timer = ui.getControlByName("timer");
            });

            room.onMessage("player_left", (client: any) => {
                this.playerEntities[client.sessionId].dispose();
            });

            room.onMessage("nickname_updated", (client: any) => {
                console.log(client);
                this.playerEntities[client.sessionId].nickname = client.nickname;
                this.playerEntities[client.sessionId].character = client.character
                this.playerEntities[client.sessionId].set_sprite();
                Hud.removeLabel(this.scene, "nickname_" + client.sessionId);
                Hud.addLabel(
                    this.scene,
                    client.nickname,
                    this.playerEntities[client.sessionId].mesh,
                    client.sessionId,
                    this.playerEntities[client.sessionId].room
                );
            });

            room.onMessage("player_fired", (client: any) => {
                const missile = new Missile(this.scene, null, client.data);
            });

            room.onMessage("player_scored_hit", (client: any) => {
                if (client.data.player_victim != this.current_player_id) return;
                let damage = available_weapons[client.data.weapon].damage;
                this.playerEntities[this.current_player_id].take_damage(damage, client.sessionId);
            });

            room.onMessage("player_died", (client: any) => {
                this.playerEntities[client.sessionId].die();
            });
        });

        // This is responsible for smoothing player movement. Shouldn't be here but it is what it is.
        this.scene.registerBeforeRender(() => {
            for (let session_id in this.playerEntities) {
                var entity = this.playerEntities[session_id].mesh;
                var targetPosition = this.playerEntities[session_id].mesh_next_position;
                // This Lerp function is very interesting, it smooths movement between position and target.
                // Change the float value to whatever suits you.
                entity.position = BABYLON.Vector3.Lerp(entity.position, targetPosition, 0.30);
            }

            for (let missile_id in this.missile_entities) {
                let missile = this.missile_entities[missile_id];

                missile.missile_mesh.rotation.x = BABYLON.Scalar.Lerp(missile.missile_mesh.position.x, missile.target_mesh.position.x + Math.random() * 0.1, 0.5);
                missile.missile_mesh.rotation.y = BABYLON.Scalar.Lerp(missile.missile_mesh.position.y, missile.target_mesh.position.y + Math.random() * 0.1, 0.5);
                missile.missile_mesh.rotation.z = BABYLON.Scalar.Lerp(missile.missile_mesh.position.z, missile.target_mesh.position.z + Math.random() * 0.1, 0.5);
                missile.missile_mesh.position = BABYLON.Vector3.Lerp(missile.missile_mesh.position, missile.target_mesh.position, 0.05);
                for (let session_id in this.playerEntities) {
                    if (session_id == this.current_player_id) continue;
                    let player = this.playerEntities[session_id].mesh;

                    if (player.intersectsMesh(missile.missile_mesh, false)) {
                        this.playerEntities[this.current_player_id].room.send("player_scored_hit", {
                            "player_attacker": this.current_player_id,
                            "player_victim": session_id,
                            "weapon":missile.weapon_name
                        });
                        missile.dispose();
                    }
                }
            }

            for (let missile_id in this.missile_entities_no_collisions) {
                let missile = this.missile_entities_no_collisions[missile_id];

                missile.missile_mesh.position = BABYLON.Vector3.Lerp(missile.missile_mesh.position, missile.target_mesh.position, 0.05);
            }
        });

        return this;
    }
}