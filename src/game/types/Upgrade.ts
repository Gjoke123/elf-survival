import type { WeaponType } from "./Weapon";

export type UpgradeType =
  | "damage"
  | "maxHp"
  | "weapon";

export type Upgrade = {
  type: UpgradeType;
  title: string;
  description: string;

  weaponType?: WeaponType;
};