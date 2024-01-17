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
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);

        let import_hud = advancedTexture.parseFromSnippetAsync("#0QWKF2#4");
        async function afterHudIsImported() {
        }
        afterHudIsImported();
    }
}