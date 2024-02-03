import * as BABYLON from '@babylonjs/core'
import { Color4, Vector3 } from '@babylonjs/core';
import { BabylonApp } from '../BabylonApp';
import { available_weapons } from '../attributes/AvailableWeapons';
import { Weapon } from './Weapon';

export const throwables = [
    {name: "throw_barrel"},
    {name: "throw_chair"},
    {name: "throw_desk"},
    {name: "throw_fridge"},
    {name: "throw_rock"},
    {name: "throw_shelf"},
];

export class Missile {
    private scene: BABYLON.Scene;
    // @ts-ignore
    private parent: Weapon;

    private speed: number = 0;
    private distance: number = 0;
    private angle: number = 0;
    private weapon_name: string = '';
    private gun_sound?: string =  '../../assets/audio/whoosh.mp3';

    private id: any;
    // @ts-ignore
    public missile_mesh: BABYLON.Mesh;
    // @ts-ignore
    public target_mesh: BABYLON.Mesh;
    // @ts-ignore
    public pivot: BABYLON.Mesh;

    public gunshot: any = false;

    constructor (
        scene: BABYLON.Scene,
        parent?: Weapon|null,
        attributes?: any
    ) {
        this.scene = scene;

        if (parent) {
            this.parent = parent;
            this.speed = this.parent.attributes.missile.speed;
            this.distance = this.parent.attributes.missile.distance;
            this.weapon_name = this.parent.attributes.name;
            this.gun_sound = this.parent.attributes.sound?.fire_path ?? this.gun_sound;
            this.fire(new Vector3(this.parent.x, 0, this.parent.z), this.parent.angle);
            return;
        }

        console.log(attributes);
        let weapon_attributes = available_weapons[attributes.weapon_selected];
        this.distance = weapon_attributes.missile.distance;
        this.speed = weapon_attributes.missile.speed;
        this.fire(new Vector3(attributes.position.x, 0, attributes.position.z), attributes.angle);
    }

    fire (current_position: Vector3, angle: number) {
        const id = Math.round(Math.random() * 999999);
        this.id = id;

        let idx = Math.round(Math.random() * (throwables.length - 1));
        let name = throwables[idx].name;
        // @ts-ignore
        const missile_mesh = this.scene.getMeshByName(name).clone("missile_" + id, null);
        // @ts-ignore
        missile_mesh.isVisible = true;
        // @ts-ignore
        missile_mesh.position.x = 0;
        // @ts-ignore
        missile_mesh.position.y = 2;
        // @ts-ignore
        missile_mesh.position.z = 0;
        // @ts-ignore
        missile_mesh.renderingGroupId = 1;

        const target_mesh = BABYLON.MeshBuilder.CreateBox(
            "target_" + id,
            {
                width: 1,
                height: 1,
                depth: 1,
            },
            this.scene
        );
        target_mesh.isVisible = false;
        target_mesh.rotate(new Vector3(Math.random(), Math.random(), Math.random()), Math.random() * 3.14);

        const pivot = BABYLON.MeshBuilder.CreateBox(
            "pivot_" + id,
            {
                width: 1,
                height: 1,
                depth: 1,
            },
            this.scene
        );
        pivot.isVisible = false;
        target_mesh.position.z = target_mesh.position.z + this.distance;

        const gunshot = new BABYLON.Sound("gunshot_" + Math.round(Math.random() * 999999), this.gun_sound, this.scene, null, {
            loop: false,
            autoplay: true,
            spatialSound: true,
            distanceModel: "exponential",
            rolloffFactor: 1.075,
        });
        // @ts-ignore
        gunshot.attachToMesh(missile_mesh);
        this.gunshot = gunshot;

        target_mesh.parent = pivot;
        // @ts-ignore
        missile_mesh.parent = pivot;
        // @ts-ignore
        missile_mesh.checkCollisions = true;
        pivot.rotate(new Vector3(0, 1, 0), angle);

        pivot.position.x = current_position.x;
        pivot.position.z = current_position.z;

        setTimeout(() => {
            this.dispose();
        }, 1000);

        this.target_mesh = target_mesh;
        // @ts-ignore
        this.missile_mesh = missile_mesh;
        this.pivot = pivot;

        if (this.parent) {
            BabylonApp.singleton().room.missiles[id] = this;
        } else {
            // @ts-ignore
            BabylonApp.singleton().room.missiles_no_collisions[id] = this;
        }

        return true;
    }

    dispose () {
        this.target_mesh.dispose();
        this.missile_mesh.dispose();
        this.pivot.dispose();
        this.gunshot.dispose();

        if (this.parent) {
            // @ts-ignore
            delete BabylonApp.singleton().room.missiles[this.id];
        } else {
            // @ts-ignore
            delete BabylonApp.singleton().room.missiles_no_collisions[this.id];
        }
    }
}