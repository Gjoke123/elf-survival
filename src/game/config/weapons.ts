import type { Weapon } from "../types/Weapon";

export const WEAPON_CONFIGS: Weapon[] = [
  {
    type: "magicBolt",
    level: 1,
    damage: 10,
    attackInterval: 0.6,
    projectileSpeed: 500,
    projectileSize: 8,
    projectileColor: "#38bdf8",
    projectileCount: 1,
    explosionRadius: 0,
    cooldown: 0,
  },

  {
    type: "fireball",
    level: 1,
    damage: 20,
    attackInterval: 1.0,
    projectileSpeed: 350,
    projectileSize: 14,
    projectileColor: "#f97316",
    projectileCount: 1,
    explosionRadius: 0,
    cooldown: 0,
  },

  {
    type: "iceShot",
    level: 1,
    damage: 8,
    attackInterval: 0.35,
    projectileSpeed: 650,
    projectileSize: 6,
    projectileColor: "#67e8f9",
    projectileCount: 1,
    explosionRadius: 0,
    cooldown: 0,
  },
];