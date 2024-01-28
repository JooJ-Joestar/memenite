import { WeaponAttributes } from "../types/WeaponAttributes";

export const crowbar: WeaponAttributes = {
    name: "Crowbar",
    sprite: {
        path: "../../assets/sprites/crowbar.png",
        width: 577,
        height: 152
    },
    // sound?: {
    //     fire_path?: string,
    //     hit_path?: string,
    // },
    damage: 20,
    cooldown: 500,
    missile: {
        distance: 20,
        speed: 5,
    }
}

export const available_weapons: any = {
    'Crowbar': crowbar
};