import type { EnemyType } from "../types/Enemy";

export type EnemyConfig = {
  type: EnemyType;
  size: number;
  speed: number;
  hp: number;
  damage: number;
  experience: number;
};

export const ENEMY_CONFIGS: EnemyConfig[] = [
  {
    type: "goblin",
    size: 20,
    speed: 90,
    hp: 20,
    damage: 5,
    experience: 10,
  },
  {
    type: "demon",
    size: 24,
    speed: 60,
    hp: 40,
    damage: 10,
    experience: 20,
  },
  {
    type: "brute",
    size: 32,
    speed: 35,
    hp: 100,
    damage: 20,
    experience: 40,
  },
  {
    type: "boss",
    size: 80,
    speed: 35,
    hp: 1000,
    damage: 25,
    experience: 500,
  },
];