import * as BABYLON from '@babylonjs/core'
import { Color4, Vector3 } from '@babylonjs/core';
import { Weapon } from './Weapon';

export class Missile {
    private scene: BABYLON.Scene;
    private parent: Weapon;

    // @ts-ignore
    public missile_mesh: BABYLON.Mesh;
    // @ts-ignore
    public target_mesh: BABYLON.Mesh;
    // @ts-ignore
    public pivot: BABYLON.Mesh;

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
            "target_" + id,
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

        const pivot = BABYLON.MeshBuilder.CreateBox(
            "pivot_" + id,
            {
                width: 1,
                height: 1,
                depth: 1,
            },
            this.scene
        );
        // pivot.position = current_position;
        // target_mesh.position = current_position;
        // target_mesh.position.z = current_position.z + this.parent.attributes.missile.distance;
        target_mesh.position.z = target_mesh.position.z + this.parent.attributes.missile.distance;

        target_mesh.parent = pivot;
        missile_mesh.parent = pivot;
        pivot.rotate(new Vector3(0, 1, 0), this.parent.angle);

        pivot.position.x = current_position.x;
        pivot.position.z = current_position.z;

        setTimeout(() => {
            missile_mesh.dispose();
            target_mesh.dispose();
            pivot.dispose();
            delete window.__LEVEL__.missile_entities[id];
        }, (this.parent.attributes.missile.distance / this.parent.attributes.missile.speed) * 100);

        this.target_mesh = target_mesh;
        this.missile_mesh = missile_mesh;
        this.pivot = pivot;

        window.__LEVEL__.missile_entities[id] = this;

        return true;
    }
}