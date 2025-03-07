import * as BABYLON from '@babylonjs/core'
import { BabylonApp } from '../BabylonApp';
import { Hud } from './Hud';

export class PlayerInput {
    public inputMap: any;
    private scene: BABYLON.Scene;

    //simple movement
    public horizontal: number = 0;
    public vertical: number = 0;
    //tracks whether or not there is movement in that axis
    public horizontalAxis: number = 0;
    public verticalAxis: number = 0;

    public controls_pressed: boolean = false;

    //Mobile Input trackers
    private ui: Hud;

    constructor(scene: BABYLON.Scene, ui: Hud) {

        this.scene = scene;
        this.ui = ui;

        //scene action manager to detect inputs
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);

        this.inputMap = {};
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        //add to the scene an observable that calls updateFromKeyboard before rendering
        scene.onBeforeRenderObservable.add(() => {
            this.updateFromKeyboard();
            this.updateFromUi();
        });

        // Set up Mobile Controls if on mobile device
        // if (this.ui.isMobile) {
        //     this._setUpMobile();
        // }
    }

    // Keyboard controls & Mobile controls
    //handles what is done when keys are pressed or if on mobile, when buttons are pressed
    private updateFromKeyboard(): void {
        this.controls_pressed = false;

        //forward - backwards movement
        if ((this.inputMap["ArrowUp"]) /*&& !this.ui.gamePaused*/) {
            // console.log("ArrowUp");
            this.verticalAxis = 1;
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);
            this.controls_pressed = true;
        } else if ((this.inputMap["ArrowDown"]) /*&& !this.ui.gamePaused*/) {
            // console.log("ArrowDown");
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
            this.controls_pressed = true;
        } else {
            // console.log("None");
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        //left - right movement
        if ((this.inputMap["ArrowLeft"]) /*&& !this.ui.gamePaused*/) {
            // console.log("ArrowLeft");
            //lerp will create a scalar linearly interpolated amt between start and end scalar
            //taking current horizontal and how long you hold, will go up to -1(all the way left)
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;
            this.controls_pressed = true;

        } else if ((this.inputMap["ArrowRight"]) /*&& !this.ui.gamePaused*/) {
            // console.log("ArrowRight");
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
            this.controls_pressed = true;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        if ((this.inputMap[" "]) /*&& !this.ui.gamePaused*/) {
            let player = BabylonApp.singleton().room.get_current_player();
            player[player.weapon_selected].fire();
            this.controls_pressed = true;
        }
    }

    private updateFromUi () {
        if (this.controls_pressed === true) return false;

        if (this.ui.movement_x != 0) {
            // console.log(this.ui.movement_x);
            this.horizontal = this.ui.movement_x / 130;
            this.controls_pressed = true;
        } else this.horizontal = 0;
        if (this.ui.movement_z != 0) {
            // console.log(this.ui.movement_z);
            this.vertical = (this.ui.movement_z / 130) * -1;
            this.controls_pressed = true;
        } else this.vertical = 0;

        return true;
    }
}