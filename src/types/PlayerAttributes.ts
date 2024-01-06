import { Color4, Vector4 } from "babylonjs";

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
    position: {
        x: number,
        y: number,
        z: number
    }
};