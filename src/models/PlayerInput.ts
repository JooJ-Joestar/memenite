import * as BABYLON from '@babylonjs/core'
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

    //jumping and dashing
    public jumpKeyDown: boolean = false;
    public dashing: boolean = false;

    //Mobile Input trackers
    private ui: Hud;
    public mobileLeft: boolean = false;
    public mobileRight: boolean = false;
    public mobileUp: boolean = false;
    public mobileDown: boolean = false;
    private _mobileJump: boolean = false;
    private _mobileDash: boolean = false;

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
            this._updateFromKeyboard();
        });

        // Set up Mobile Controls if on mobile device
        // if (this._ui.isMobile) {
        //     this._setUpMobile();
        // }
    }

    // Keyboard controls & Mobile controls
    //handles what is done when keys are pressed or if on mobile, when buttons are pressed
    private _updateFromKeyboard(): void {

        //forward - backwards movement
        if ((this.inputMap["ArrowUp"] || this.mobileUp) /*&& !this._ui.gamePaused*/) {
            // console.log("ArrowUp");
            this.verticalAxis = 1;
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);

        } else if ((this.inputMap["ArrowDown"] || this.mobileDown) /*&& !this._ui.gamePaused*/) {
            // console.log("ArrowDown");
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        } else {
            // console.log("None");
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        //left - right movement
        if ((this.inputMap["ArrowLeft"] || this.mobileLeft) /*&& !this._ui.gamePaused*/) {
            // console.log("ArrowLeft");
            //lerp will create a scalar linearly interpolated amt between start and end scalar
            //taking current horizontal and how long you hold, will go up to -1(all the way left)
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        } else if ((this.inputMap["ArrowRight"] || this.mobileRight) /*&& !this._ui.gamePaused*/) {
            // console.log("ArrowRight");
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        //dash
        if ((this.inputMap["Shift"] || this._mobileDash) /*&& !this._ui.gamePaused*/) {
            this.dashing = true;
        } else {
            this.dashing = false;
        }

        //Jump Checks (SPACE)
        if ((this.inputMap[" "] || this._mobileJump) /*&& !this._ui.gamePaused*/) {
            this.jumpKeyDown = true;
        } else {
            this.jumpKeyDown = false;
        }
    }

    // Mobile controls
    /*private _setUpMobile(): void {
        //Jump Button
        this._ui.jumpBtn.onPointerDownObservable.add(() => {
            this._mobileJump = true;
        });
        this._ui.jumpBtn.onPointerUpObservable.add(() => {
            this._mobileJump = false;
        });

        //Dash Button
        this._ui.dashBtn.onPointerDownObservable.add(() => {
            this._mobileDash = true;
        });
        this._ui.dashBtn.onPointerUpObservable.add(() => {
            this._mobileDash = false;
        });

        //Arrow Keys
        this._ui.leftBtn.onPointerDownObservable.add(() => {
            this.mobileLeft = true;
        });
        this._ui.leftBtn.onPointerUpObservable.add(() => {
            this.mobileLeft = false;
        });

        this._ui.rightBtn.onPointerDownObservable.add(() => {
            this.mobileRight = true;
        });
        this._ui.rightBtn.onPointerUpObservable.add(() => {
            this.mobileRight = false;
        });

        this._ui.upBtn.onPointerDownObservable.add(() => {
            this.mobileUp = true;
        });
        this._ui.upBtn.onPointerUpObservable.add(() => {
            this.mobileUp = false;
        });

        this._ui.downBtn.onPointerDownObservable.add(() => {
            this.mobileDown = true;
        });
        this._ui.downBtn.onPointerUpObservable.add(() => {
            this.mobileDown = false;
        });
    }*/

}