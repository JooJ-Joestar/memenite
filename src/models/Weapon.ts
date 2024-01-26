import * as BABYLON from '@babylonjs/core'
import { Color4, Vector3 } from '@babylonjs/core';
import { WeaponAttributes } from "../types/WeaponAttributes";

export class Weapon {
    private scene: BABYLON.Scene;

    private attributes: WeaponAttributes;
    private cooldown: boolean = false;

    private sprite_manager: BABYLON.SpriteManager;
    private sprite: BABYLON.Sprite;

    private angle: number = 0;
    private x: number = 0;
    private z: number = 0;

    constructor (
        scene: BABYLON.Scene,
        session_id: string,
        attributes: WeaponAttributes
    ) {
        this.scene = scene;
        this.attributes = attributes;

        this.sprite_manager = new BABYLON.SpriteManager(
            "weapon_manager_" + session_id + "_" + this.attributes.name,
            this.attributes.sprite.path,
            1,
            {width: this.attributes.sprite.width, height: this.attributes.sprite.height},
            this.scene
        );
        this.sprite = new BABYLON.Sprite("player_" + session_id + "_weapon_" + this.attributes.name, this.sprite_manager);
        this.sprite.cellIndex = 0;
        this.sprite.width = (this.attributes.sprite.width / 100);
        this.sprite.height = (this.attributes.sprite.height / 100);
    }

    fire (current_position: Vector3, angle: number) {
        if (this.cooldown === true) return false;
        this.cooldown = true;

        const missile_mesh = BABYLON.MeshBuilder.CreateBox(
            "missile_" + (Math.random() * 999999),
            {
                width: 1,
                height: 1,
                depth: 1,
                faceColors: [
                    new Color4(0, 0, 1, 1),
                    new Color4(0, 0, 1, 1),
                    new Color4(0, 0, 1, 1),
                    new Color4(0, 0, 1, 1),
                    new Color4(0, 0, 1, 1),
                    new Color4(0, 0, 1, 1),
                ]
            },
            this.scene
        );

        const target_mesh = BABYLON.MeshBuilder.CreateBox(
            "missile_" + (Math.random() * 999999),
            {
                width: 1,
                height: 1,
                depth: 1,
                faceColors: [
                    new Color4(0, 1, 0, 1),
                    new Color4(0, 1, 0, 1),
                    new Color4(0, 1, 0, 1),
                    new Color4(0, 1, 0, 1),
                    new Color4(0, 1, 0, 1),
                    new Color4(0, 1, 0, 1),
                ]
            },
            this.scene
        );
        target_mesh.position.x = missile_mesh.position.x;
        target_mesh.position.z = missile_mesh.position.z + this.attributes.missile.distance;
        target_mesh.parent = missile_mesh;
        missile_mesh.position.x = this.x;
        missile_mesh.position.z = this.z;
        missile_mesh.rotate(new BABYLON.Vector3(0,1,0), this.angle);

        setTimeout(() => {
            missile_mesh.dispose();
            target_mesh.dispose();
        }, (this.attributes.missile.distance / this.attributes.missile.speed) * 100);

        setTimeout(() => {
            this.cooldown = false;
        }, this.attributes.cooldown);
        return true;
    }
}