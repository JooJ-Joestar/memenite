import * as BABYLON from '@babylonjs/core';
import { crowbar } from '../attributes/AvailableWeapons';
import { BabylonApp } from '../BabylonApp';
import * as PlayerAttributes from '../types/PlayerAttributes';
import { Hud } from './Hud';
import { PlayerInput } from './PlayerInput';
import { Weapon } from './Weapon';

export const animations: any = {
    "up": {start: 0, end: 2, rest: 1},
    "down": {start: 0, end: 2, rest: 1},
    "left": {start: 3, end: 5, rest: 4},
    "right": {start: 6, end: 8, rest: 7},
};

export class Player extends BABYLON.TransformNode {
    static RESPAWN_COOLDOWN = 3000;

    static RESPAWN_AREAS = [
        // {
        //     min_x: -20,
        //     max_x: -40,
        //     min_z: -106,
        //     max_z: -144
        // },
        // {
        //     min_x: 44,
        //     max_x: 57,
        //     min_z: -83,
        //     max_z: -170
        // },
        // {
        //     min_x: 2,
        //     max_x: 31,
        //     min_z: -80,
        //     max_z: -75
        // },
        // {
        //     min_x: -22,
        //     max_x: -32,
        //     min_z: -79,
        //     max_z: -67
        // },
        // {
        //     min_x: -11,
        //     max_x: -31,
        //     min_z: -49,
        //     max_z: -30
        // },
        {
            min_x: -28,
            max_x: -21,
            min_z: 11,
            max_z: 21
        },
        // {
        //     min_x: -42,
        //     max_x: -22,
        //     min_z: 25,
        //     max_z: 40
        // },
        // {
        //     min_x: -42,
        //     max_x: -20,
        //     min_z: 47,
        //     max_z: 64
        // },
        // {
        //     min_x: -21,
        //     max_x: -41,
        //     min_z: 106,
        //     max_z: 95
        // },
        // {
        //     min_x: 20,
        //     max_x: 32,
        //     min_z: 11,
        //     max_z: 24
        // },
        // {
        //     min_x: 65,
        //     max_x: 34,
        //     min_z: 88,
        //     max_z: 81
        // },
        // {
        //     min_x: 51,
        //     max_x: 36,
        //     min_z: -56,
        //     max_z: -23
        // },
    ];

    // Mesh that represents the player.
    // @ts-ignore
    private mesh: BABYLON.Mesh;
    // @ts-ignore
    private sprite_manager: BABYLON.SpriteManager;
    // @ts-ignore
    private sprite: BABYLON.Sprite;
    private animation_playing: string = "none";
    // Target mesh for movement smoothing.
    private mesh_next_position: any;
    // If this is the current player, assigns inputs to it.
    private input: any = null;
    private nickname: string = "";
    private hitpoints: number = 100;

    //Camera
    private camera: any = false;
    private camRoot: BABYLON.TransformNode = new BABYLON.TransformNode('camRoot');
    private yTilt: BABYLON.TransformNode = new BABYLON.TransformNode('yTilt');

    //const values
    private static readonly PLAYER_SPEED: number = 0.45;

    //player movement vars
    private pause: boolean = false;
    private h: number = 0;
    private v: number = 0;

    private moveDirection: BABYLON.Vector3 = new BABYLON.Vector3();
    private inputAmt: number = 0;

    // Colyseus.js
    private session_id: string = "";
    private room: any = null;
    private is_current: boolean = false;

    private hud: any = null;

    private weapon_selected: string = "weapon_melee";
    private weapon_melee: Weapon|boolean = false;

    public character: string = "pepe";

    constructor (
        room: any,
        session_id: string,
        is_current: boolean,
        character: string,
        nickname?: string,
    ) {
        super(session_id, BabylonApp.singleton().scene);
        this.room = room;
        this.session_id = session_id;
        this.is_current = is_current;

        if (nickname) {
            this.nickname = nickname;
        }

        // Picks attributes according to the character.
        let attributes: any = null;

        // Assign controls to this player if it is the current one.
        if (is_current === true) {
            this.hud = new Hud(BabylonApp.singleton().scene, room, this);
            this.input = new PlayerInput(BabylonApp.singleton().scene, this.hud);
            this.respawn();

            // Despite the dumb name, anything that needs to be checked like inputs, triggers, animations and stuff are registered in here.
            this.activatePlayerCamera(attributes);
        } else {
            this.set_sprite();

            // This is temporary, as this box is only a representation of the player. Should be changed for a model or sprite later on.
            this.mesh = BABYLON.MeshBuilder.CreateBox("player_" + this.session_id, {height: 5});
            this.mesh.isVisible = false;
            this.mesh.position.set(0, 0.3, 0);

            Hud.addLabel(BabylonApp.singleton().scene, this.nickname, this.mesh, this.session_id, this.room);
        }

        this.weapon_melee = new Weapon(BabylonApp.singleton().scene, this.session_id, crowbar, is_current);

        // Don't ask me.
        this.camRoot.rotate(BABYLON.Axis.Y, -1.5);
    }

    //--GAME UPDATES--
    private beforeRenderUpdate(): void {
        this.updateFromControls();
    }

    public activatePlayerCamera(attributes: any)/*: BABYLON.UniversalCamera*/ {
        // Setting up camera to follow player.
        this.camera = new BABYLON.ArcRotateCamera(
            "player_camera",
            0,
            0.75,
            30,
            this.mesh.position,
            BabylonApp.singleton().scene
        );
        this.camera.mode = BABYLON.ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
        const rect: any = BabylonApp.singleton().engine.getRenderingCanvasClientRect();
        const aspect = rect.height / rect.width;
        // In this example we'll set the distance based on the camera's radius.
        // Will we? I don't remember. Anyways, just use the debugger to find a cool placement for the camera.
        this.camera.orthoLeft   = -this.camera.radius;
        this.camera.orthoRight  =  this.camera.radius;
        this.camera.orthoBottom = -this.camera.radius * aspect;
        this.camera.orthoTop    =  this.camera.radius * aspect;

        BabylonApp.singleton().scene.activeCamera = this.camera;

        BabylonApp.singleton().scene.registerBeforeRender(() => {
            this.beforeRenderUpdate();
            // this.updateCamera();)
        })
    }

    private updateFromControls(): void {
        if (this.pause === true) {
            return;
        }

        this.moveDirection = BABYLON.Vector3.Zero();
        this.h = this.input.horizontal; //right, x
        this.v = this.input.vertical; //fwd, z

        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        let fwd = this.camRoot.forward;
        let right = this.camRoot.right;
        let correctedVertical = fwd.scaleInPlace(this.v);
        let correctedHorizontal = right.scaleInPlace(this.h);

        //movement based off of camera's view
        let move = correctedHorizontal.addInPlace(correctedVertical);

        //clear y so that the character doesnt fly up, normalize for next step, taking into account whether we've DASHED or not
        this.moveDirection = new BABYLON.Vector3((move).normalize().x /** dashFactor*/, 0, (move).normalize().z /** dashFactor*/);

        //clamp the input value so that diagonal movement isn't twice as fast
        let inputMag = Math.abs(this.h) + Math.abs(this.v);
        if (inputMag < 0) {
            this.inputAmt = 0;
        } else if (inputMag > 1) {
            this.inputAmt = 1;
        } else {
            this.inputAmt = inputMag;
        }
        //final movement that takes into consideration the inputs
        this.moveDirection = this.moveDirection.scaleInPlace(this.inputAmt * Player.PLAYER_SPEED);
        this.mesh.moveWithCollisions(this.moveDirection);
        this.mesh.position.y = 0;
        this.room.send("updatePosition", {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
            x_movement: this.moveDirection._x,
            z_movement: this.moveDirection._z,
        });
        this.sprite.position.x = this.mesh.position.x;
        this.sprite.position.y = this.mesh.position.y + 1.70;
        this.sprite.position.z = this.mesh.position.z;

        this.camera.setTarget(this.mesh.position);
        this.camera.setPosition(new BABYLON.Vector3(30 + this.sprite.position.x, 30, this.sprite.position.z));

        // rotation based on input & the camera angle
        let angle = Math.atan2(this.input.vertical, this.input.horizontal);
        // @ts-ignore
        this[this.weapon_selected].angle = angle * (-1);
        // @ts-ignore
        this[this.weapon_selected].x = this.mesh.position.x;
        // @ts-ignore
        this[this.weapon_selected].z = this.mesh.position.z;
    }

    public check_animation (x: number, z: number) {
        if (z > 0 && Math.abs(z) > Math.abs(x)) {
            this.play_animation("right");
        } else if (z < 0 && Math.abs(z) > Math.abs(x)) {
            this.play_animation("left");
        } else if (x > 0 && Math.abs(x) > Math.abs(z)) {
            this.play_animation("down");
        } else if (x < 0 && Math.abs(x) > Math.abs(z)) {
            this.play_animation("up");
        }
    }

    public play_animation (animation: string) {
        if (!animations[animation] || this.animation_playing == animation) return false;

        this.animation_playing = animation;
        this.sprite.playAnimation(animations[animation].start, animations[animation].end, false, 100, () => {
            this.animation_playing = "none";
            this.sprite.cellIndex = animations[animation].rest;
        });
        return true;
    }

    public dispose() {
        this.mesh.dispose();
        this.camRoot.dispose();
        this.yTilt.dispose();
        this.sprite.dispose();
        this.sprite_manager.dispose();
        Hud.removeLabel(BabylonApp.singleton().scene, "nickname_" + this.session_id);
        super.dispose();
        return true;
    }

    take_damage (amt: number, killer: string) {
        this.hitpoints -= amt;
        if (this.hitpoints <= 0) {
            this.hitpoints = 0;
            this.die(killer);
        }
        this.hud.hp.value = this.hitpoints;

        const bonk = new BABYLON.Sound("bonk_" + Math.round(Math.random() * 999999), '../../assets/audio/bonk.mp3', BabylonApp.singleton().scene, null, {
            loop: false,
            autoplay: true,
            spatialSound: true,
        });
        bonk.attachToMesh(this.mesh);
        bonk.maxDistance = 50;
    }

    take_life (amt: number) {
        this.hitpoints += amt;
        if (this.hitpoints > 100) {
            this.hitpoints = 100;
        }
        if (this.hud.hp) {
            this.hud.hp.value = this.hitpoints;
        }
    }

    die (killer?: string) {
        this.pause = true;
        this.mesh.dispose()
        this.sprite.dispose();
        if (this.is_current === true) {
            this.room.send("player_died", {
                session_id: this.session_id,
                killer: killer
            });
        }

        setTimeout(() => {
            this.respawn();
        }, Player.RESPAWN_COOLDOWN);
    }

    respawn () {
        let index = Math.round(Math.random() * (Player.RESPAWN_AREAS.length - 1));
        let x = Player.RESPAWN_AREAS[index].min_x;
        let z = Player.RESPAWN_AREAS[index].min_z;

        x *= 2;
        z *= 2;

        this.set_sprite();

        // This is temporary, as this box is only a representation of the player. Should be changed for a model or sprite later on.
        this.mesh = BABYLON.MeshBuilder.CreateBox("player_" + this.session_id, {width: 2, height: 5, depth: 2});
        this.mesh.isVisible = false;
        this.mesh.position.set(x, 0.3, z);
        this.pause = false;

        if (this.hud) {
            this.take_life(100);
        }

        Hud.addLabel(BabylonApp.singleton().scene, this.nickname, this.mesh, this.session_id, this.room);
    }

    set_sprite (x: number = 0, z: number = 0) {
        if (this.sprite_manager) {
            this.sprite_manager.dispose();
        }
        if (this.sprite) {
            this.sprite.dispose();
        }

        this.sprite_manager = new BABYLON.SpriteManager(
            "manager_" + this.session_id,
            "../../assets/sprites/" + this.character + ".png",
            1,
            {width: 256, height: 256},
            BabylonApp.singleton().scene
        );

        this.sprite = new BABYLON.Sprite("player_" + this.session_id, this.sprite_manager);
        this.sprite.cellIndex = 1;
        this.sprite.width = 5;
        this.sprite.height= 5;
        this.sprite.position = new BABYLON.Vector3(x, 1.25, z);
        this.sprite.isVisible = true;
    }
}