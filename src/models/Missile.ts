import * as BABYLON from '@babylonjs/core'
import { Color4, Vector3 } from '@babylonjs/core';
import { Weapon } from './Weapon';

export class Missile {
    private scene: BABYLON.Scene;
    private parent: Weapon;

    constructor (
        scene: BABYLON.Scene,
        parent: Weapon
    ) {
        this.scene = scene;
        this.parent = parent;

        this.fire(new Vector3(this.parent.x, 0, this.parent.z), this.parent.angle);
    }

    fire (current_position: Vector3, angle: number) {
        const id = Math.round(Math.random() * 999999);

        const missile_mesh = BABYLON.MeshBuilder.CreateBox(
            "missile_" + id,
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
            "missile_" + id,
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
        target_mesh.position.z = missile_mesh.position.z + this.parent.attributes.missile.distance;
        target_mesh.parent = missile_mesh;
        missile_mesh.position.x = this.parent.x;
        missile_mesh.position.z = this.parent.z;
        missile_mesh.rotate(new BABYLON.Vector3(0,1,0), this.parent.angle);

        console.log(target_mesh.position);

        this.scene.registerBeforeRender(() => {
            missile_mesh.position = BABYLON.Vector3.Lerp(missile_mesh.position, target_mesh.position, 0.30);
        });

        setTimeout(() => {
            missile_mesh.dispose();
            target_mesh.dispose();
        }, (this.parent.attributes.missile.distance / this.parent.attributes.missile.speed) * 100);

        return true;
    }
}