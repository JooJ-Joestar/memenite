import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui';

export class Hud {
    private scene: BABYLON.Scene;
    private room: any;

    public gamePaused: boolean = false;

    constructor(
        scene: any,
        room: any
    ) {
        this.scene = scene;
        this.room = room;
        // var grid = new GUI.Grid();

        // GUI
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var button1 = Button.CreateSimpleButton("but1", "Click Me");
        button1.width = "150px"
        button1.height = "40px";
        button1.color = "white";
        button1.cornerRadius = 20;
        button1.background = "green";
        button1.onPointerUpObservable.add(function() {
            alert("you did it!");
        });
        advancedTexture.addControl(button1);
    }
}