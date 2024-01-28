import { Color4, Vector4 } from "@babylonjs/core";

export type PlayerAttributes = {
    mesh: {
        size?: number;
        width?: number;
        height?: number;
        depth?: number;
        faceUV?: Vector4[];
        sideOrientation?: number;
        frontUVs?: Vector4;
        backUVs?: Vector4;
        wrap?: boolean;
        topBaseAt?: number;
        bottomBaseAt?: number;
        updatable?: boolean;
    },
    sprite?: {
        path?: string
    },
    position: {
        x: number,
        y: number,
        z: number
    }
};

export const available_characters = [
    {name: "pepe"},
    {name: "amogus"},
    {name: "dollynho"},
    {name: "barriguinha_mole"},
    {name: "Corote"},
    {name: "the_rock"},
    {name: "doge"},
    {name: "kek"},
    {name: "maxwell"},
    {name: "polish_cow"},
    {name: "skibdy"},
    {name: "spritesheet"},
    {name: "taunt_guy"},
    {name: "sanic"},
    {name: "nyancat"},
    {name: "bike"},
    {name: "menes"},
    {name: "spoder"},
    {name: "007"},
    {name: "shrek"},
    {name: "jester"},
];

// export const red_options: PlayerAttributes = {
//     mesh: {
//         size: 1,
//         width: 1,
//         height: 1,
//         depth: 1,
//     },
//     sprite: {
//         path: "../../assets/sprites/the_rock.png"
//     },
//     position: {
//         x: -6.5,
//         y: 0.5,
//         z: 6.5
//     }
// };

// export const green_options: PlayerAttributes = {
//     mesh: {
//         size: 1,
//         width: 1,
//         height: 1,
//         depth: 1,
//     },
//     sprite: {
//         path: "../../assets/sprites/doge.png"
//     },
//     position: {
//         x: 7.5,
//         y: 0.5,
//         z: -6.5
//     }
// };