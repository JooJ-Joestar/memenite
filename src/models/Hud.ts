import * as BABYLON from '@babylonjs/core';
import { Color3, Color4 } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control, Ellipse, TextBlock } from '@babylonjs/gui';
import { Player } from './Player';

export class Hud {
    private scene: BABYLON.Scene;
    private room: any;
    private player: Player;

    public gamePaused: boolean = false;

    public movement_x: number = 0;
    public movement_z: number = 0;

    public ui: AdvancedDynamicTexture;
    public controls_ui: any;

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

        let import_hud = ui.parseFromSnippetAsync("#0QWKF2#8");
        async function afterHudIsImported(player: any, entity_labels: any) {
            const result = await import_hud;
            console.log(ui.getDescendants());
            const field_nickname: any = ui.getControlByName("nickname");
            const btn_ready: any = ui.getControlByName("ready");

            btn_ready.onPointerUpObservable.add(() => {
                field_nickname.isVisible = false;
                btn_ready.isVisible = false;
                player.nickname = field_nickname.text;
                Hud.addLabel(player.scene, player.nickname, player.mesh, player.session_id, player.room);
                player.room.send("update_nickname", {
                    nickname: player.nickname
                })
            });
        }
        afterHudIsImported(this.player, entity_labels);
        this.ui = ui;
        this.mobileCommands();
    }

    public static addLabel (scene: BABYLON.Scene, label: string, mesh: BABYLON.Mesh, id: string, room: any) {
        let entity_labels: any = Hud.pickOrCreateEntityLabels(scene);

        const player_nickname = new TextBlock("nickname_" + id);
        player_nickname.text = label;
        player_nickname.fontSize = 13;
        player_nickname.color = "White";
        player_nickname.shadowColor = "#000";
        player_nickname.shadowBlur = 5;
        entity_labels.addControl(player_nickname);
        player_nickname.linkWithMesh(mesh);
        player_nickname.linkOffsetY = -27;
    }

    public static removeLabel (scene: BABYLON.Scene, label_id: string) {
        let entity_labels = Hud.pickOrCreateEntityLabels(scene);
        let label = entity_labels.getControlByName(label_id);
        if (label) {
            label.dispose();
        }
    }

    public static pickOrCreateEntityLabels(scene: BABYLON.Scene) {
        let entity_labels: any = scene.getTextureByName("entity_labels");
        if (!entity_labels) {
            entity_labels = AdvancedDynamicTexture.CreateFullscreenUI("entity_labels", true, scene);
        }
        return entity_labels;
    }

    public mobileCommands(){
        let xAddPos = 0;
        let yAddPos = 0;
        let xAddRot = 0;
        let yAddRot = 0;
        let sideJoystickOffset = 35;
        let bottomJoystickOffset = -55;
        let translateTransform;
        let adt = AdvancedDynamicTexture.CreateFullscreenUI("controls_ui");

        let leftThumbContainer = this.makeThumbArea("leftThumb", 2, "white", "grey");
        leftThumbContainer.height = "200px";
        leftThumbContainer.width = "200px";
        leftThumbContainer.isPointerBlocker = true;
        leftThumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftThumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        leftThumbContainer.alpha = 0.4;
        leftThumbContainer.left = sideJoystickOffset;
        leftThumbContainer.top = bottomJoystickOffset;

        let leftInnerThumbContainer = this.makeThumbArea("leftInnterThumb", 4, "white", null);
        leftInnerThumbContainer.height = "80px";
        leftInnerThumbContainer.width = "80px";
        leftInnerThumbContainer.isPointerBlocker = true;
        leftInnerThumbContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        leftInnerThumbContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;


        let leftPuck = this.makeThumbArea("leftPuck", 0, "blue", null);
        leftPuck.height = "30px";
        leftPuck.width = "30px";
        leftPuck.isPointerBlocker = true;
        leftPuck.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        leftPuck.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;


        leftThumbContainer.onPointerDownObservable.add((coordinates) => {
            leftPuck.isVisible = true;
            leftPuck.floatLeft = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
            leftPuck.left = leftPuck.floatLeft;
            leftPuck.floatTop = coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            leftPuck.top = leftPuck.floatTop * -1;
            leftPuck.isDown = true;
            leftThumbContainer.alpha = 0.9;
            // console.log(leftPuck.floatLeft);
            // console.log(leftPuck.floatTop);

            this.movement_x = leftPuck.floatLeft;
            this.movement_z = leftPuck.floatTop;
        });

        leftThumbContainer.onPointerUpObservable.add((coordinates) => {
            xAddPos = 0;
            yAddPos = 0;
            leftPuck.isDown = false;
            leftPuck.isVisible = false;
            leftThumbContainer.alpha = 0.4;
            this.movement_x = 0;
            this.movement_z = 0;
        });

        leftThumbContainer.onPointerMoveObservable.add((coordinates) => {
            if (leftPuck.isDown) {
                xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
                yAddPos = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
                leftPuck.floatLeft = xAddPos;
                leftPuck.floatTop = yAddPos * -1;
                leftPuck.left = leftPuck.floatLeft;
                leftPuck.top = leftPuck.floatTop;
                // console.log(leftPuck.floatLeft);
                // console.log(leftPuck.floatTop);

                this.movement_x = leftPuck.floatLeft;
                this.movement_z = leftPuck.floatTop;
            }
        });

        adt.addControl(leftThumbContainer);
        leftThumbContainer.addControl(leftInnerThumbContainer);
        leftThumbContainer.addControl(leftPuck);
        leftPuck.isVisible = false;
    }

    private makeThumbArea(name: any, thickness: any, color: any, background: any, curves?: any){
        let rect = new Ellipse();
        rect.name = name;
        rect.thickness = thickness;
        rect.color = color;
        rect.background = background;
        rect.paddingLeft = "0px";
        rect.paddingRight = "0px";
        rect.paddingTop = "0px";
        rect.paddingBottom = "0px";
        return rect;
    }
}