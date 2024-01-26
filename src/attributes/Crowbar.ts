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
    damage: 10,
    cooldown: 250,
    missile: {
        distance: 1,
        speed: 1,
    }
}