import * as BABYLON from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, TextBlock } from '@babylonjs/gui';
import { Player } from './Player';

export class Hud {
    private scene: BABYLON.Scene;
    private room: any;
    private player: Player;

    public gamePaused: boolean = false;

    constructor(
        scene: any,
        room: any,
        player: Player,
    ) {
        this.scene = scene;
        this.room = room;
        this.player = player;
        // var grid = new GUI.Grid();

        // GUI
        var ui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        var entity_labels = Hud.pickOrCreateEntityLabels(this.scene);

        let import_hud = ui.parseFromSnippetAsync("#0QWKF2#4");
        async function afterHudIsImported(player: any, entity_labels: any) {
            const result = await import_hud;
            console.log(ui.getDescendants());
            const field_nickname: any = ui.getControlByName("nickname");
            const btn_ready: any = ui.getControlByName("ready");

            btn_ready.onPointerUpObservable.add(() => {
                field_nickname.isVisible = false;
                btn_ready.isVisible = false;
                player.nickname = field_nickname.text;

                const player_nickname = new TextBlock();
                player_nickname.text = player.nickname;
                player_nickname.fontSize = 13;
                player_nickname.color = "White";
                player_nickname.shadowColor = "#000";
                player_nickname.shadowBlur = 5;
                entity_labels.addControl(player_nickname);
                player_nickname.linkWithMesh(player.mesh);
                player_nickname.linkOffsetY = 15;
            });
        }
        afterHudIsImported(this.player, entity_labels);
    }

    public static addLabel (scene: BABYLON.Scene, label: string, mesh: BABYLON.Mesh) {
        let entity_labels: any = Hud.pickOrCreateEntityLabels(scene);

        const player_nickname = new TextBlock();
        player_nickname.text = label;
        player_nickname.fontSize = 13;
        player_nickname.color = "White";
        player_nickname.shadowColor = "#000";
        player_nickname.shadowBlur = 5;
        entity_labels.addControl(player_nickname);
        player_nickname.linkWithMesh(mesh);
        player_nickname.linkOffsetY = 15;
    }

    public static pickOrCreateEntityLabels(scene: BABYLON.Scene) {
        let entity_labels: any = scene.getTextureByName("entity_labels");
        if (!entity_labels) {
            entity_labels = AdvancedDynamicTexture.CreateFullscreenUI("entity_labels", true, scene);
        }
        return entity_labels;
    }
}