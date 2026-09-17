export type EnemyType =
  | "goblin"
  | "demon"
  | "brute"
  | "boss";

export type Enemy = {
  id: number;
  type: EnemyType;

  x: number;
  y: number;

  size: number;

  speed: number;

  hp: number;
  maxHp: number;

  damage: number;

  experience: number;
};