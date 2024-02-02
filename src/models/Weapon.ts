import * as BABYLON from '@babylonjs/core'
import { Color4, Vector3 } from '@babylonjs/core';
import { WeaponAttributes } from "../types/WeaponAttributes";
import { Missile } from './Missile';

export class Weapon {
    private scene: BABYLON.Scene;

    public attributes: WeaponAttributes;
    private cooldown: boolean = false;

    private sprite_manager: BABYLON.SpriteManager;
    // @ts-ignore
    private sprite: BABYLON.Sprite;

    public angle: number = 0;
    public x: number = 0;
    public z: number = 0;

    public is_current: boolean = false;

    constructor (
        scene: BABYLON.Scene,
        session_id: string,
        attributes: WeaponAttributes,
        is_current?: boolean
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

        this.attributes.sound = this.attributes.sound ?? {};
        this.attributes.sound.fire_path = '../../assets/audio/whoosh.mp3';

        if (is_current === true) {
            this.is_current = true;
        }
    }

    fire (current_position: Vector3, angle: number) {
        if (this.cooldown === true) return false;
        this.cooldown = true;

        const missile = new Missile(this.scene, this);

        setTimeout(() => {
            this.cooldown = false;
        }, this.attributes.cooldown);
        return true;
    }
}