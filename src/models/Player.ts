import * as BABYLON from 'babylonjs';
import * as PlayerAttributes from '../types/PlayerAttributes';
import { PlayerInput } from './PlayerInput';

export class Player extends BABYLON.TransformNode {
    private mesh: BABYLON.Mesh;
    private scene: BABYLON.Scene;
    private input: PlayerInput;

    //Camera
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

    constructor (
        session_id: string,
        character: string,
        scene: BABYLON.Scene,
        attributes: PlayerAttributes.PlayerAttributes,
        // shadowGenerator: BABYLON.ShadowGenerator,
        // input?: PlayerInput,
    ) {
        super(session_id, scene);
        this.scene = scene;
        this.mesh = BABYLON.MeshBuilder.CreateBox(session_id, attributes.mesh, scene);
        this.mesh.position.set(attributes.position.x, attributes.position.y, attributes.position.z);

        // let pivot = new BABYLON.TransformNode(name + "_pivot");
        // this.mesh.parent = pivot;
        // pivot.position = new BABYLON.Vector3(0,0,0);
        this.camRoot.rotate(BABYLON.Axis.Y, -0.75);

        // if (input) {
        //     this.input = input;
        // }
        return this;
    }

    public static setCharacter(
        session_id: string,
        player_ref: any,
        character: string,
        scene: BABYLON.Scene,
        is_current: boolean = false
    ) {
        let attributes: any = null;
        switch (character) {
            case "kek":
                attributes = PlayerAttributes.kek_options;
            break;
            case "husband": default:
                attributes = PlayerAttributes.husband_options;
            break;
        }

        const player = new Player(
            session_id,
            character,
            scene,
            attributes
        );

        if (is_current === true) {
            player.input = new PlayerInput(scene);
            player.activatePlayerCamera();
        }

        return player;
    }

    //--GAME UPDATES--
    private beforeRenderUpdate(): void {
        this.updateFromControls();
        // this.updateGroundDetection();
        // this.animatePlayer();
        // console.log(this.moveDirection);
    }

    public activatePlayerCamera()/*: BABYLON.UniversalCamera*/ {
        this.scene.registerBeforeRender(() => {

            this.beforeRenderUpdate();
            // this.updateCamera();

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
}