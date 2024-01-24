export type WeaponAttributes = {
    name: string,
    sprite: {
        path: string,
        width: number,
        height: number
    },
    sound?: {
        fire_path?: string,
        hit_path?: string,
    },
    damage: number,
    cooldown: number,
    missile: {
        distance: number,
        speed: number,
    }
};