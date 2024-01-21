import { Color4, Vector4 } from "@babylonjs/core";

export type PlayerAttributes = {
    mesh: {
        size?: number;
        width?: number;
        height?: number;
        depth?: number;
        faceUV?: Vector4[];
        faceColors?: Color4[];
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

export const red_options: PlayerAttributes = {
    mesh: {
        size: 1,
        width: 1,
        height: 1,
        depth: 1,
        faceColors: [
            new Color4(1, 0, 0, 1),
            new Color4(1, 0, 0, 1),
            new Color4(1, 0, 0, 1),
            new Color4(1, 0, 0, 1),
            new Color4(1, 0, 0, 1),
            new Color4(1, 0, 0, 1),
        ],
    },
    sprite: {
        path: "../../assets/sprites/amogus_red.png"
    },
    position: {
        x: -6.5,
        y: 0.5,
        z: 6.5
    }
};

export const green_options: PlayerAttributes = {
    mesh: {
        size: 1,
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
        ],
    },
    sprite: {
        path: "../../assets/sprites/amogus_green.png"
    },
    position: {
        x: 7.5,
        y: 0.5,
        z: -6.5
    }
};