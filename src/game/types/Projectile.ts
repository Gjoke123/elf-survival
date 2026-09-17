import type { WeaponType } from "./Weapon";

export type Projectile = {
  id: number;

  weaponType: WeaponType;

  x: number;
  y: number;

  size: number;
  speed: number;
  damage: number;

  targetId: number | null;

  directionX: number;
  directionY: number;
};