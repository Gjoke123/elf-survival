export type LootType =
  | "healthPotion"
  | "gold"
  | "damageBoost"
  | "attackSpeed";

export type Loot = {
  id: number;
  x: number;
  y: number;
  size: number;
  type: LootType;
  value: number;
};