export type WeaponType =
  | "magicBolt"
  | "fireball"
  | "iceShot";

export type Weapon = {
  type: WeaponType;

  level: number;

  damage: number;
  attackInterval: number;

  projectileSpeed: number;
  projectileSize: number;

  projectileColor: string;

  projectileCount: number;

  explosionRadius: number;

  cooldown: number;
};