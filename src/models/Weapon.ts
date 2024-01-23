import * as BABYLON from '@babylonjs/core'
import { Vector3 } from '@babylonjs/core';
import { WeaponAttributes } from "../types/WeaponAttributes";

export class Player {
    private attributes: WeaponAttributes;
    private cooldown: boolean = false;

    constructor (
        scene: BABYLON.Scene,
        weapon_attributes: WeaponAttributes
    ) {
        this.attributes = weapon_attributes;
    }

    fire (current_position: Vector3) {
        if (this.cooldown === true) return false;
        this.cooldown = true;

        setTimeout(() => {
            this.cooldown = false;
        }, this.attributes.cooldown);
        return true;
    }
}