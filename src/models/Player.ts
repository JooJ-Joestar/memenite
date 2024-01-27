import * as BABYLON from '@babylonjs/core';
import { crowbar } from '../attributes/AvailableWeapons';
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
    // Mesh that represents the player.
    private mesh: BABYLON.Mesh;
    private sprite_manager: BABYLON.SpriteManager;
    private sprite: BABYLON.Sprite;
    private animation_playing: string = "none";
    // Target mesh for movement smoothing.
    private mesh_next_position: any;
    private scene: BABYLON.Scene;
    private engine: any;
    // If this is the current player, assigns inputs to it.
    private input: any = null;
    private nickname: string = "Noname";

    //Camera
    private camera: any = false;
    private camRoot: BABYLON.TransformNode = new BABYLON.TransformNode('camRoot');
    private yTilt: BABYLON.TransformNode = new BABYLON.TransformNode('yTilt');

    //const values
    private static readonly PLAYER_SPEED: number = 0.45;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;
    private static readonly DASH_FACTOR: number = 2.5;
    private static readonly DASH_TIME: number = 10; //how many frames the dash lasts
    private static readonly DOWN_TILT: BABYLON.Vector3 = new BABYLON.Vector3(0.8290313946973066, 0, 0);
    private static readonly ORIGINAL_TILT: BABYLON.Vector3 = new BABYLON.Vector3(0.5934119456780721, 0, 0);
    public dashTime: number = 0;

    //player movement vars
    private pause: boolean = true;
    private deltaTime: number = 0;
    private h: number = 0;
    private v: number = 0;

    private moveDirection: BABYLON.Vector3 = new BABYLON.Vector3();
    private inputAmt: number = 0;

    // Colyseus.js
    private session_id: string = "";
    private player_ref: any = null;
    private room: any = null;

    private hud: any = null;

    private weapon_selected: string = "weapon_melee";
    private weapon_melee: Weapon|boolean = false;
    private weapon_ranged: Weapon|boolean = false;
    private weapon_special: Weapon|boolean = false;

    constructor (
        room: any,
        scene: BABYLON.Scene,
        session_id: string,
        player_ref: any,
        is_current: boolean,
        character: string,
        nickname?: string,
        engine?: any
    ) {
        super(session_id, scene);
        this.scene = scene;
        this.engine = engine;
        this.room = room;
        this.player_ref = player_ref;
        this.session_id = session_id;

        if (nickname) {
            this.nickname = nickname;
        }

        // Picks attributes according to the character.
        let attributes: any = null;
        switch (character) {
            case "kek":
                attributes = PlayerAttributes.red_options;
            break;
            case "husband": default:
                attributes = PlayerAttributes.green_options;
            break;
        }

        this.sprite_manager = new BABYLON.SpriteManager(
            "manager_" + session_id,
            attributes.sprite.path,
            1,
            {width: 256, height: 256},
            this.scene
        );
        this.sprite = new BABYLON.Sprite("player_" + session_id, this.sprite_manager);
        this.sprite.cellIndex = 1;
        this.sprite.width = 3;
        this.sprite.height= 3;
        this.sprite.position = new BABYLON.Vector3(attributes.position.x, attributes.position.y + 1.25, attributes.position.z);

        // This is temporary, as this box is only a representation of the player. Should be changed for a model or sprite later on.
        this.mesh = BABYLON.MeshBuilder.CreateBox(session_id, attributes.mesh, scene);
        this.mesh.isVisible = false;
        this.mesh.position.set(attributes.position.x, attributes.position.y + 0.3, attributes.position.z);

        // Assign controls to this player if it is the current one.
        if (is_current === true) {
            this.hud = new Hud(scene, room, this);
            this.input = new PlayerInput(scene, this.hud);

            // Despite the dumb name, anything that needs to be checked like inputs, triggers, animations and stuff are registered in here.
            this.activatePlayerCamera(attributes);
        } else {
            Hud.addLabel(this.scene, this.nickname, this.mesh, this.session_id, this.room);
        }

        this.weapon_melee = new Weapon(this.scene, this.session_id, crowbar, is_current);
        this.adjustWeaponPosition();

        // Don't ask me.
        this.camRoot.rotate(BABYLON.Axis.Y, -1.5);
    }

    private adjustWeaponPosition(weapon?: string) {
        // if (!weapon) {
        //     weapon = this.weapon_selected;
        // }
        // @ts-ignore
        // this[weapon].sprite.position = new BABYLON.Vector3(this.sprite.position.x, this.sprite.position.y, this.sprite.position.z);
    }

    //--GAME UPDATES--
    private beforeRenderUpdate(): void {
        this.updateFromControls();
        // this.updateGroundDetection();
        // this.animatePlayer();
    }

    public activatePlayerCamera(attributes: any)/*: BABYLON.UniversalCamera*/ {
        // Setting up camera to follow player.
        this.camera = new BABYLON.ArcRotateCamera(
            "player_camera",
            0,
            0.75,
            30,
            this.mesh.position,
            this.scene
        );
        this.camera.mode = BABYLON.ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
        const rect: any = this.engine.getRenderingCanvasClientRect();
        const aspect = rect.height / rect.width;
        // In this example we'll set the distance based on the camera's radius.
        // Will we? I don't remember. Anyways, just use the debugger to find a cool placement for the camera.
        this.camera.orthoLeft   = -this.camera.radius;
        this.camera.orthoRight  =  this.camera.radius;
        this.camera.orthoBottom = -this.camera.radius * aspect;
        this.camera.orthoTop    =  this.camera.radius * aspect;

        this.scene.activeCamera = this.camera;

        this.scene.registerBeforeRender(() => {
            this.beforeRenderUpdate();
            // this.updateCamera();)
        })
        // return this.camera;
    }

    private updateFromControls(): void {
        if (this.pause === true) {
            return;
        }

        this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this.moveDirection = BABYLON.Vector3.Zero();
        this.h = this.input.horizontal; //right, x
        this.v = this.input.vertical; //fwd, z

        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        let fwd = this.camRoot.forward;
        // console.log(fwd);
        let right = this.camRoot.right;
        let correctedVertical = fwd.scaleInPlace(this.v);
        let correctedHorizontal = right.scaleInPlace(this.h);

        //movement based off of camera's view
        let move = correctedHorizontal.addInPlace(correctedVertical);
        // console.log(move);

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
        // console.log(this.inputAmt);
        // console.log(this.inputAmt);
        this.moveDirection = this.moveDirection.scaleInPlace(this.inputAmt * Player.PLAYER_SPEED);
        // console.log(this.moveDirection);
        this.mesh.moveWithCollisions(this.moveDirection);
        this.room.send("updatePosition", {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
            x_movement: this.moveDirection._x,
            z_movement: this.moveDirection._z,
        })
        this.sprite.position.x = this.mesh.position.x;
        this.sprite.position.y = this.mesh.position.y + 1.25;
        this.sprite.position.z = this.mesh.position.z;
        this.adjustWeaponPosition();
        this.camera.setTarget(this.mesh.position);
        // console.log(this.camera.position());
        this.camera.setPosition(new BABYLON.Vector3(15 + this.sprite.position.x, 15, this.sprite.position.z));
        // console.log(this.mesh.position);
        // console.log(this.moveDirection);

        //check if there is movement to determine if rotation is needed
        // let input = new BABYLON.Vector3(this.input.horizontalAxis, 0, this.input.verticalAxis); //along which axis is the direction
        // if (input.length() == 0) {//if there's no input detected, prevent rotation and keep player in same rotation
        //     return;
        // }

        // rotation based on input & the camera angle
        let angle = Math.atan2(this.input.vertical, this.input.horizontal);
        if (angle != 0) {
            // @ts-ignore
            this[this.weapon_selected].angle = angle * (-1);
        }
        // @ts-ignore
        this[this.weapon_selected].x = this.mesh.position.x;
        // @ts-ignore
        this[this.weapon_selected].z = this.mesh.position.z;
        // angle += this.camRoot.rotation.y;
        // let targ = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
        // console.log(targ);
        // this.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this.deltaTime);
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
        delete this.player_ref;
        Hud.removeLabel(this.scene, "nickname_" + this.session_id);
        super.dispose();
        return true;
    }
}