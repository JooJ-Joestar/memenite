import * as BABYLON from '@babylonjs/core';
import * as PlayerAttributes from '../types/PlayerAttributes';
import { Hud } from './Hud';
import { PlayerInput } from './PlayerInput';

export const animations: any = {
    "up": {start: 9, end: 11, rest: 10},
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
            {width: 87, height: 107},
            this.scene
        );
        this.sprite = new BABYLON.Sprite("player_" + session_id, this.sprite_manager);
        this.sprite.cellIndex = 1;
        this.sprite.width = (87 / 100) * 1.5;
        this.sprite.height= (107 / 100) * 1.5;
        this.sprite.position = new BABYLON.Vector3(attributes.position.x, attributes.position.y, attributes.position.z);

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

        // Don't ask me.
        this.camRoot.rotate(BABYLON.Axis.Y, -0.75);
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
            5.5,
            1.0,
            30,
            new BABYLON.Vector3(attributes.position.x, attributes.position.y, attributes.position.z),
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
        this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this.moveDirection = BABYLON.Vector3.Zero();
        this.h = this.input.horizontal; //right, x
        this.v = this.input.vertical; //fwd, z

        //tutorial, if the player moves for the first time
        // if((this.h != 0 || this.v != 0) && !this.tutorial_move){
        //     this.tutorial_move = true;
        // }

        //--DASHING--
        //limit dash to once per ground/platform touch
        //can only dash when in the air
        // if (this.input.dashing && !this._dashPressed && this._canDash && !this._grounded) {
        //     this._canDash = false;
        //     this._dashPressed = true;

        //     //sfx and animations
        //     this._currentAnim = this._dash;
        //     this._dashingSfx.play();

        //     //tutorial, if the player dashes for the first time
        //     if(!this.tutorial_dash){
        //         this.tutorial_dash = true;
        //     }
        // }

        // let dashFactor = 1;
        //if you're dashing, scale movement
        // if (this._dashPressed) {
        //     if (this.dashTime > Player.DASH_TIME) {
        //         this.dashTime = 0;
        //         this._dashPressed = false;
        //     } else {
        //         dashFactor = Player.DASH_FACTOR;
        //     }
        //     this.dashTime++;
        // }

        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        let fwd = this.camRoot.forward;
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
        this.sprite.position.y = this.mesh.position.y;
        this.sprite.position.z = this.mesh.position.z;
        this.camera.setTarget(new BABYLON.Vector3(this.sprite.position.x, this.sprite.position.y, this.sprite.position.z));
        // console.log(this.camera.position());
        this.camera.setPosition(new BABYLON.Vector3(15 + this.sprite.position.x, 15, -15 + this.sprite.position.z));
        // console.log(this.mesh.position);
        // console.log(this.moveDirection);

        //check if there is movement to determine if rotation is needed
        // let input = new BABYLON.Vector3(this.input.horizontalAxis, 0, this.input.verticalAxis); //along which axis is the direction
        // if (input.length() == 0) {//if there's no input detected, prevent rotation and keep player in same rotation
        //     return;
        // }

        // rotation based on input & the camera angle
        // let angle = Math.atan2(this.input.horizontalAxis, this.input.verticalAxis);
        // angle += this.camRoot.rotation.y;
        // let targ = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
        // console.log(targ);
        // this.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this.deltaTime);
    }

    public check_animation (x: number, z: number) {
        if (z > 0 && Math.abs(z) > Math.abs(x)) {
            this.play_animation("up");
        } else if (z < 0 && Math.abs(z) > Math.abs(x)) {
            this.play_animation("down");
        } else if (x > 0 && Math.abs(x) > Math.abs(z)) {
            this.play_animation("right");
        } else if (x < 0 && Math.abs(x) > Math.abs(z)) {
            this.play_animation("left");
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