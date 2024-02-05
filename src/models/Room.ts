import * as BABYLON from "@babylonjs/core";
import * as Colyseus from "colyseus.js";
import { Player } from '../models/Player';
import { COLYSEUS_URL } from '../BabylonApp';
import { Hud } from "../models/Hud";
import { Missile } from "../models/Missile";
import { available_weapons } from "../attributes/AvailableWeapons";

export class Room {
    private scene: any;

    // We DO NOT need to save the colliders somewhere as Babylon.js will handle them automatically, but I wanted
    // a quick way of knowing which element was a collider so one can quickly hide them during debugging.
    private colliders: BABYLON.AbstractMesh[] = [];

    // Now THIS is required. We need to quickly know the properties of everyone connected.
    // This should probably be moved somewhere else, maybe even have a class of it's own.
    public players: any = {};
    public missiles: any = {};
    public missiles_no_collisions: any = {};

    private current_player_id: string = "";

    // Connects to the Colyseus backend.
    public colyseusSDK: Colyseus.Client = new Colyseus.Client(COLYSEUS_URL);

    constructor(
        scene?: BABYLON.Scene,
    ) {
        // @ts-ignore
        this.scene = scene;

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
                    if (this.players[sessionId]) return;

                    // Creates the player model.
                    this.players[sessionId] = new Player(
                        room,
                        player,
                        is_current_player,
                        player.character,
                        player.nickname
                    );
                });

                // This is part of what is responsible for smoothing player movement, and is one of the things that should be moved
                // somewhere else. Perhaps Player.
                this.players[sessionId].mesh_next_position = this.players[sessionId].mesh.position.clone();
                player.onChange(() => {
                    // With interpolation
                    this.players[sessionId].check_animation(player.x_movement, player.z_movement);
                    this.players[sessionId].mesh_next_position.set(player.x, player.y, player.z);
                    this.players[sessionId].sprite.position.set(player.x, player.y + 1.25, player.z);

                    // Without interpolation
                    // this.playerEntities[sessionId].mesh.position.set(player.x, player.y, player.z);

                });
            });

            room.onMessage("timer", (client: any) => {
                let ui = this.scene.getTextureByName("UI");
                let timer = ui.getControlByName("timer");
            });

            room.onMessage("player_left", (client: any) => {
                this.players[client.sessionId].dispose();
            });

            room.onMessage("nickname_updated", (client: any) => {
                console.log(client);
                this.players[client.sessionId].nickname = client.nickname;
                this.players[client.sessionId].character = client.character
                this.players[client.sessionId].set_sprite();
                Hud.removeLabel(this.scene, "nickname_" + client.sessionId);
                Hud.addLabel(
                    this.scene,
                    client.nickname,
                    this.players[client.sessionId].mesh,
                    client.sessionId,
                    this.players[client.sessionId].room
                );
            });

            room.onMessage("player_fired", (client: any) => {
                const missile = new Missile(this.scene, null, client.data);
            });

            room.onMessage("player_scored_hit", (client: any) => {
                if (client.data.player_victim != this.current_player_id) return;
                let damage = available_weapons[client.data.weapon].damage;
                this.players[this.current_player_id].take_damage(damage, client.sessionId);
            });

            room.onMessage("player_died", (client: any) => {
                this.players[client.sessionId].die();
            });
        });

        // This is responsible for smoothing player movement. Shouldn't be here but it is what it is.
        this.scene.registerBeforeRender(() => {
            for (let session_id in this.players) {
                var entity = this.players[session_id].mesh;
                var targetPosition = this.players[session_id].mesh_next_position;
                // This Lerp function is very interesting, it smooths movement between position and target.
                // Change the float value to whatever suits you.
                entity.position = BABYLON.Vector3.Lerp(entity.position, targetPosition, 0.30);
            }

            for (let missile_id in this.missiles) {
                let missile = this.missiles[missile_id];

                missile.missile_mesh.rotation.x = BABYLON.Scalar.Lerp(missile.missile_mesh.position.x, missile.target_mesh.position.x + Math.random() * 0.1, 0.5);
                missile.missile_mesh.rotation.y = BABYLON.Scalar.Lerp(missile.missile_mesh.position.y, missile.target_mesh.position.y + Math.random() * 0.1, 0.5);
                missile.missile_mesh.rotation.z = BABYLON.Scalar.Lerp(missile.missile_mesh.position.z, missile.target_mesh.position.z + Math.random() * 0.1, 0.5);
                missile.missile_mesh.position = BABYLON.Vector3.Lerp(missile.missile_mesh.position, missile.target_mesh.position, 0.05);
                for (let session_id in this.players) {
                    if (session_id == this.current_player_id) continue;
                    let player = this.players[session_id].mesh;

                    if (player.intersectsMesh(missile.missile_mesh, false)) {
                        this.players[this.current_player_id].room.send("player_scored_hit", {
                            "player_attacker": this.current_player_id,
                            "player_victim": session_id,
                            "weapon":missile.weapon_name
                        });
                        missile.dispose();
                    }
                }
            }

            for (let missile_id in this.missiles_no_collisions) {
                let missile = this.missiles_no_collisions[missile_id];

                missile.missile_mesh.position = BABYLON.Vector3.Lerp(missile.missile_mesh.position, missile.target_mesh.position, 0.05);
            }
        });

        return this;
    }

    public get_current_player () {
        return this.players[this.current_player_id];
    }
}