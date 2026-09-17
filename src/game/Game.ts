import type { Upgrade } from "./types/Upgrade";
import type { Enemy } from "./types/Enemy";
import type { Projectile } from "./types/Projectile";
import type { ExperienceGem } from "./types/ExperienceGem.ts";
import type { Loot } from "./types/Loot";
import { ENEMY_CONFIGS, } from "./config/enemies";
import type { Weapon, WeaponType } from "./types/Weapon";
import { WEAPON_CONFIGS } from "./config/weapons";
import { LEVEL_CONFIGS } from "./config/levels";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private enemies: Enemy[] = [];
  private nextEnemyId = 1;
  private spawnTimer = 0;
  private projectiles: Projectile[] = [];
  private nextProjectileId = 1;
  private experienceGems: ExperienceGem[] = [];
  private nextGemId = 1;
  private playerLevel = 1;
  private playerExperience = 0;
  private experienceToNextLevel = 50;
  private loot: Loot[] = [];
  private nextLootId = 1;
  private playerGold = 0;
  private currentLevel = 1;
  private levelTime = 0;
  private readonly enemySpawnMultiplier = 3;
  private readonly maxEnemies = 100;
  private bossSpawned = false;
  private weapons: Weapon[] = [
  WEAPON_CONFIGS[0],
  ];

  private player = {
    x: 400,
    y: 300,
    size: 24,
    speed: 250,
  };

private playerStats = {
  damage: 10,
  maxHp: 100,
  hp: 100,
};

private getCurrentLevelConfig() {
  return LEVEL_CONFIGS[this.currentLevel - 1];
}

private clearLevelObjects() {
  this.enemies = [];
  this.projectiles = [];
  this.experienceGems = [];
  this.loot = [];
}

private paused = false;
private gameOver = false;

private onLevelUp?: (upgrades: Upgrade[]) => void;

private spawnEnemy() {
  const normalEnemyConfigs = ENEMY_CONFIGS.filter(
    (config) => config.type !== "boss"
  );

  const config =
    normalEnemyConfigs[
      Math.floor(Math.random() * normalEnemyConfigs.length)
    ];

  let x = 0;
  let y = 0;

  const side = Math.floor(Math.random() * 4);

  switch (side) {
    case 0:
      // top
      x = Math.random() * this.canvas.width;
      y = -config.size;
      break;

    case 1:
      // right
      x = this.canvas.width + config.size;
      y = Math.random() * this.canvas.height;
      break;

    case 2:
      // bottom
      x = Math.random() * this.canvas.width;
      y = this.canvas.height + config.size;
      break;

    case 3:
      // left
      x = -config.size;
      y = Math.random() * this.canvas.height;
      break;
  }

    this.enemies.push({
      id: this.nextEnemyId++,
      type: config.type,
      x,
      y,
      size: config.size,
      speed: config.speed,
      hp: config.hp,
      maxHp: config.hp,
      damage: config.damage,
      experience: config.experience,
      });
}


private onGameOver?: () => void;
private damageCooldown = 0;
private damageCooldownDuration = 0.5;

private checkEnemyCollisions() {
  if (this.damageCooldown > 0) {
    return;
  }

  for (const enemy of this.enemies) {
    const distance = this.getDistance(
      this.player.x,
      this.player.y,
      enemy.x,
      enemy.y
    );

    const collisionDistance =
      this.player.size / 2 + enemy.size / 2;

    if (distance < collisionDistance) {
      this.playerStats.hp -= enemy.damage;

      this.damageCooldown = this.damageCooldownDuration;

      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;

      const length = Math.sqrt(dx * dx + dy * dy) || 1;

      enemy.x += (dx / length) * 30;
      enemy.y += (dy / length) * 30;

      if (this.playerStats.hp <= 0) {
        this.playerStats.hp = 0;
        this.handleGameOver();
      }

      return;
    }
  }
}
private spawnBoss() {
  const config = ENEMY_CONFIGS.find(
    (enemy) => enemy.type === "boss"
  );

  if (!config) {
    return;
  }

  const side = Math.floor(Math.random() * 4);

  let x = 0;
  let y = 0;

  switch (side) {
    case 0:
      x = Math.random() * this.canvas.width;
      y = -config.size;
      break;

    case 1:
      x = this.canvas.width + config.size;
      y = Math.random() * this.canvas.height;
      break;

    case 2:
      x = Math.random() * this.canvas.width;
      y = this.canvas.height + config.size;
      break;

    case 3:
      x = -config.size;
      y = Math.random() * this.canvas.height;
      break;
  }

  const levelMultiplier = this.currentLevel;

  this.enemies.push({
    id: this.nextEnemyId++,
    type: "boss",
    x,
    y,
    size: config.size,
    speed: config.speed,
    hp: config.hp * levelMultiplier,
    maxHp: config.hp * levelMultiplier,
    damage: config.damage * levelMultiplier,
    experience: config.experience,
  });

  this.bossSpawned = true;
}
private spawnLoot(x: number, y: number) {
  // 30% шанс выпадения
  if (Math.random() > 0.3) {
    return;
  }

  const types = [
    "healthPotion",
    "gold",
    "damageBoost",
    "attackSpeed",
  ] as const;

  const type = types[Math.floor(Math.random() * types.length)];

  let value = 0;

  switch (type) {
    case "healthPotion":
      value = 30;
      break;

    case "gold":
      value = Math.floor(Math.random() * 10) + 5;
      break;

    case "damageBoost":
      value = 5;
      break;

    case "attackSpeed":
      value = 0.05;
      break;
  }

  this.loot.push({
    id: this.nextLootId++,
    x,
    y,
    size: 14,
    type,
    value,
  });
}

private updateEnemies(deltaTime: number) {
  for (const enemy of this.enemies) {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      continue;
    }

    const directionX = dx / distance;
    const directionY = dy / distance;

    enemy.x += directionX * enemy.speed * deltaTime;
    enemy.y += directionY * enemy.speed * deltaTime;
  }
}

  private keys = new Set<string>();
  private lastTime = 0;
  private animationFrame = 0;

constructor(
  canvas: HTMLCanvasElement,
  onLevelUp: (upgrades: Upgrade[]) => void,
  onGameOver: () => void,
  onLevelComplete: (
    currentLevel: number,
    nextLevel: number
  ) => void,
  onVictory: () => void
) {
  this.canvas = canvas;
  this.onLevelUp = onLevelUp;
  this.onGameOver = onGameOver;
  this.onLevelComplete = onLevelComplete;
  this.onVictory = onVictory;
  const ctx = canvas.getContext("2d");
  

  if (!ctx) {
    throw new Error("Canvas 2D context is not supported");
  }

  this.ctx = ctx;

  this.resize();

  window.addEventListener("keydown", this.handleKeyDown);
  window.addEventListener("keyup", this.handleKeyUp);
  window.addEventListener("resize", this.resize);

  this.animationFrame = requestAnimationFrame(
    this.gameLoop
  );
}

continueToNextLevel() {
  if (this.currentLevel >= LEVEL_CONFIGS.length) {
    return;
  }

  this.currentLevel += 1;

  this.levelTime = 0;

  this.spawnTimer = 0;

  this.bossSpawned = false;

  this.enemies = [];
  this.clearLevelObjects();
  this.paused = false;
}

private handleVictory() {
  this.paused = true;
  this.onVictory();
}

private onLevelComplete: (
  currentLevel: number,
  nextLevel: number
) => void;

private onVictory: () => void;

  private handleKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.key.toLowerCase());
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key.toLowerCase());
  };

  private resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private gameLoop = (timestamp: number) => {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

private findNearestEnemy(
  x = this.player.x,
  y = this.player.y
): Enemy | undefined {
  let nearestEnemy: Enemy | undefined;
  let nearestDistance = Infinity;

  for (const enemy of this.enemies) {
    const distance = this.getDistance(
      x,
      y,
      enemy.x,
      enemy.y
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestEnemy = enemy;
    }
  }

  return nearestEnemy;
}

private upgradeMagicBolt(weapon: Weapon) {
  switch (weapon.level) {
    case 2:
      weapon.damage *= 1.2;
      break;

    case 3:
      weapon.projectileCount += 1;
      break;

    case 4:
      weapon.projectileSpeed *= 1.2;
      break;

    case 5:
      weapon.projectileCount += 1;
      break;
  }
}

private upgradeFireball(weapon: Weapon) {
  switch (weapon.level) {
    case 2:
      weapon.damage *= 1.25;
      break;

    case 3:
      weapon.projectileSpeed *= 1.2;
      break;

    case 4:
      weapon.explosionRadius = 50;
      break;

    case 5:
      weapon.damage *= 1.25;
      break;
  }
}

private upgradeIceShot(weapon: Weapon) {
  switch (weapon.level) {
    case 2:
      weapon.damage *= 1.2;
      break;

    case 3:
      weapon.projectileCount += 1;
      break;

    case 4:
      weapon.projectileSpeed *= 1.25;
      break;

    case 5:
      weapon.projectileCount += 1;
      break;
  }
}

private upgradeWeapon(weapon: Weapon) {
  if (weapon.level >= 5) {
    return;
  }

  weapon.level += 1;

  switch (weapon.type) {
    case "magicBolt":
      this.upgradeMagicBolt(weapon);
      break;

    case "fireball":
      this.upgradeFireball(weapon);
      break;

    case "iceShot":
      this.upgradeIceShot(weapon);
      break;
  }
}

addWeapon(type: WeaponType) {
  const existingWeapon = this.weapons.find(
    (weapon) => weapon.type === type
  );

  if (existingWeapon) {
    this.upgradeWeapon(existingWeapon);
    return;
  }

  const config = WEAPON_CONFIGS.find(
    (weapon) => weapon.type === type
  );

  if (!config) {
    return;
  }

  this.weapons.push({
    ...config,
    cooldown: 0,
  });
}

private getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}

private handleGameOver() {
  if (this.gameOver) {
    return;
  }

  this.gameOver = true;
  this.paused = true;

  this.onGameOver?.();
}

restart() {
  this.enemies = [];
  this.projectiles = [];
  this.experienceGems = [];
  this.loot = [];

  this.player.x = this.canvas.width / 2;
  this.player.y = this.canvas.height / 2;

  this.playerStats.hp = this.playerStats.maxHp;

  this.playerLevel = 1;
  this.playerExperience = 0;
  this.experienceToNextLevel = 50;

  this.playerGold = 0;
  this.spawnTimer = 0;
  this.damageCooldown = 0;

  this.gameOver = false;
  this.paused = false;
}

private shoot(weapon: Weapon): boolean {
  const enemy = this.findNearestEnemy();

  if (!enemy) {
    return false;
  }

  const dx = enemy.x - this.player.x;
  const dy = enemy.y - this.player.y;

  const distance = Math.sqrt(dx * dx + dy * dy) || 1;

  const directionX = dx / distance;
  const directionY = dy / distance;

  const damage =
    weapon.damage *
    (this.playerStats.damage / 10);

  for (let i = 0; i < weapon.projectileCount; i++) {
    this.projectiles.push({
      id: this.nextProjectileId++,
      weaponType: weapon.type,

      x: this.player.x,
      y: this.player.y,

      size: weapon.projectileSize,
      speed: weapon.projectileSpeed,
      damage,

      targetId: enemy.id,

      directionX,
      directionY,
    });
  }

  return true;
}

private generateUpgrades(): Upgrade[] {
  const upgrades: Upgrade[] = [];

  upgrades.push({
    type: "damage",
    title: "Power",
    description: "+20% Damage",
  });

  upgrades.push({
    type: "maxHp",
    title: "Vitality",
    description: "+20 Max HP",
  });

  const availableWeapons = WEAPON_CONFIGS.filter(
    (config) =>
      !this.weapons.some(
        (weapon) => weapon.type === config.type
      )
  );

  for (const weapon of availableWeapons) {
    upgrades.push({
      type: "weapon",
      title: this.getWeaponTitle(weapon.type),
      description: `Unlock ${this.getWeaponTitle(weapon.type)}`,
      weaponType: weapon.type,
    });
  }

  for (const weapon of this.weapons) {
    if (weapon.level >= 5) {
      continue;
    }

    upgrades.push({
      type: "weapon",
      title: `${this.getWeaponTitle(weapon.type)} Lv.${weapon.level + 1}`,
      description: this.getWeaponUpgradeDescription(weapon),
      weaponType: weapon.type,
    });
  }

  return this.shuffle(upgrades).slice(0, 3);
}

private getWeaponTitle(type: WeaponType): string {
  switch (type) {
    case "magicBolt":
      return "Magic Bolt";

    case "fireball":
      return "Fireball";

    case "iceShot":
      return "Ice Shot";
  }
}

private shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

private getWeaponUpgradeDescription(
  weapon: Weapon
): string {
  const nextLevel = weapon.level + 1;

  switch (weapon.type) {
    case "magicBolt":
      switch (nextLevel) {
        case 2:
          return "+20% damage";

        case 3:
          return "+1 projectile";

        case 4:
          return "+20% projectile speed";

        case 5:
          return "+1 projectile";

        default:
          return "Upgrade Magic Bolt";
      }

    case "fireball":
      switch (nextLevel) {
        case 2:
          return "+25% damage";

        case 3:
          return "+20% projectile speed";

        case 4:
          return "Explosion on hit";

        case 5:
          return "+25% damage";

        default:
          return "Upgrade Fireball";
      }

    case "iceShot":
      switch (nextLevel) {
        case 2:
          return "+20% damage";

        case 3:
          return "+1 projectile";

        case 4:
          return "+25% projectile speed";

        case 5:
          return "+1 projectile";

        default:
          return "Upgrade Ice Shot";
      }
  }
}

private checkLevelUp() {
  if (
    this.playerExperience <
    this.experienceToNextLevel
  ) {
    return;
  }

  this.playerExperience -=
    this.experienceToNextLevel;

  this.playerLevel += 1;

  this.experienceToNextLevel =
    Math.floor(
      this.experienceToNextLevel * 1.25
    );
  
  const upgrades = this.generateUpgrades();

  this.paused = true;
  this.onLevelUp?.(upgrades);
}

private updateProjectiles(deltaTime: number) {
  for (const projectile of this.projectiles) {
    let target = projectile.targetId !== null
      ? this.enemies.find(
          (enemy) => enemy.id === projectile.targetId
        )
      : undefined;

    if (!target) {
      target = this.findNearestEnemy(
        projectile.x,
        projectile.y
      );

      if (target) {
        projectile.targetId = target.id;
      }
    }

    if (target) {
      const dx = target.x - projectile.x;
      const dy = target.y - projectile.y;

      const distance =
        Math.sqrt(dx * dx + dy * dy) || 1;

      projectile.directionX = dx / distance;
      projectile.directionY = dy / distance;
    }

    projectile.x +=
      projectile.directionX *
      projectile.speed *
      deltaTime;

    projectile.y +=
      projectile.directionY *
      projectile.speed *
      deltaTime;
  }

  this.projectiles = this.projectiles.filter(
    (projectile) =>
      projectile.x > -100 &&
      projectile.x < this.canvas.width + 100 &&
      projectile.y > -100 &&
      projectile.y < this.canvas.height + 100
  );
}

private checkProjectileCollisions() {
  const projectilesToRemove = new Set<number>();
  const enemiesToRemove = new Set<number>();

  for (const projectile of this.projectiles) {
    const target = this.enemies.find(
      (enemy) => enemy.id === projectile.targetId
    );

    if (!target) {
      projectilesToRemove.add(projectile.id);
      continue;
    }

    const distance = this.getDistance(
      projectile.x,
      projectile.y,
      target.x,
      target.y
    );

    if (distance < target.size / 2 + projectile.size / 2) {
      target.hp -= projectile.damage;

      projectilesToRemove.add(projectile.id);

    if (target.hp <= 0) {
      if (target.type === "boss") {
        this.handleBossDefeated(target);
        continue;
      }
    this.spawnExperienceGem(target.x, target.y, target.experience);
    this.spawnLoot(target.x, target.y);

    this.enemies = this.enemies.filter(
        (enemy) => enemy.id !== target.id
    );
    }
    }
  }



  this.projectiles = this.projectiles.filter(
    (projectile) =>
      !projectilesToRemove.has(projectile.id)
  );

  this.enemies = this.enemies.filter(
    (enemy) => !enemiesToRemove.has(enemy.id)
  );
}

private handleBossDefeated(enemy: Enemy) {
  this.enemies = this.enemies.filter(
    (currentEnemy) =>
      currentEnemy.id !== enemy.id
  );


  if (this.currentLevel >= LEVEL_CONFIGS.length) {
    this.handleVictory();
    return;
  }

  this.completeLevel();
}

private collectLoot() {
  this.loot = this.loot.filter((item) => {
    const distance = this.getDistance(
      this.player.x,
      this.player.y,
      item.x,
      item.y
    );

    if (distance > 25) {
      return true;
    }

    switch (item.type) {
      case "healthPotion":
        this.playerStats.hp = Math.min(
          this.playerStats.hp + item.value,
          this.playerStats.maxHp
        );
        break;

      case "gold":
        this.playerGold += item.value;
        break;

      case "damageBoost":
        this.playerStats.damage += item.value;
        break;
    }

    return false;
  });
}

private spawnExperienceGem(
  x: number,
  y: number,
  value: number
) {
  const gem: ExperienceGem = {
    id: this.nextGemId++,

    x,
    y,

    size: 10,
    value,
  };

  this.experienceGems.push(gem);
}

private collectExperienceGems() {
  const gemsToRemove = new Set<number>();

  for (const gem of this.experienceGems) {
    const distance = this.getDistance(
      this.player.x,
      this.player.y,
      gem.x,
      gem.y
    );

    if (
      distance <
      this.player.size / 2 + gem.size / 2 + 10
    ) {
      this.playerExperience += gem.value;

      gemsToRemove.add(gem.id);
    }
  }

  this.experienceGems =
    this.experienceGems.filter(
      (gem) => !gemsToRemove.has(gem.id)
    );
}

private drawProjectiles() {
  for (const projectile of this.projectiles) {
    const weapon = WEAPON_CONFIGS.find(
      (weapon) =>
        weapon.type === projectile.weaponType
    );

    if (!weapon) {
      continue;
    }

    this.ctx.fillStyle =
      weapon.projectileColor;

    this.ctx.fillRect(
      projectile.x - projectile.size / 2,
      projectile.y - projectile.size / 2,
      projectile.size,
      projectile.size
    );
  }
}

applyUpgrade(upgrade: Upgrade) {
  switch (upgrade.type) {
    case "damage":
      this.playerStats.damage *= 1.2;
      break;

    case "maxHp":
      this.playerStats.maxHp += 20;
      this.playerStats.hp += 20;
      break;

    case "weapon":
      if (upgrade.weaponType) {
        this.addWeapon(upgrade.weaponType);
      }
      break;
  }

  this.paused = false;
}
private update(deltaTime: number) {
  if (this.paused || this.gameOver) return;
  
  if (this.damageCooldown > 0) {
    this.damageCooldown -= deltaTime;
  }
  let directionX = 0;
  let directionY = 0;

  if (this.keys.has("w") || this.keys.has("arrowup")) {
    directionY -= 1;
  }

  if (this.keys.has("s") || this.keys.has("arrowdown")) {
    directionY += 1;
  }

  if (this.keys.has("a") || this.keys.has("arrowleft")) {
    directionX -= 1;
  }

  if (this.keys.has("d") || this.keys.has("arrowright")) {
    directionX += 1;
  }

  if (directionX !== 0 && directionY !== 0) {
    const length = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    directionX /= length;
    directionY /= length;
  }

  this.player.x += directionX * this.player.speed * deltaTime;
  this.player.y += directionY * this.player.speed * deltaTime;

  const halfSize = this.player.size / 2;

  this.player.x = Math.max(
    halfSize,
    Math.min(this.canvas.width - halfSize, this.player.x)
  );

  this.player.y = Math.max(
    halfSize,
    Math.min(this.canvas.height - halfSize, this.player.y)
  );

  const levelConfig = this.getCurrentLevelConfig();

  this.spawnTimer -= deltaTime;

  if (
    this.spawnTimer <= 0 &&
    this.enemies.length < this.maxEnemies
  ) {
    this.spawnEnemy();

    this.spawnTimer =
      levelConfig.spawnInterval /
      this.enemySpawnMultiplier;
  }

  

  this.levelTime += deltaTime;

  if (
    this.levelTime >= levelConfig.duration &&
    !this.bossSpawned
  ) {
    this.spawnBoss();
  }
  
  this.collectExperienceGems();
  this.checkLevelUp();
  this.updateEnemies(deltaTime);;
  this.updateWeapons(deltaTime);
  this.updateProjectiles(deltaTime);
  this.checkProjectileCollisions();
  this.checkEnemyCollisions();
  this.collectLoot();
}

private updateWeapons(deltaTime: number) {
  for (const weapon of this.weapons) {
    weapon.cooldown -= deltaTime;

    if (weapon.cooldown <= 0) {
      const fired = this.shoot(weapon);

      if (fired) {
        weapon.cooldown = weapon.attackInterval;
      }
    }
  }
}



private completeLevel() {
  this.paused = true;

  this.onLevelComplete(
    this.currentLevel,
    this.currentLevel + 1
  );
}

private drawExperienceGems() {
  const { ctx } = this;

  for (const gem of this.experienceGems) {
    const size = gem.size;

    ctx.fillStyle = "#22d3ee";

    ctx.beginPath();

    ctx.moveTo(
      gem.x,
      gem.y - size / 2
    );

    ctx.lineTo(
      gem.x + size / 2,
      gem.y
    );

    ctx.lineTo(
      gem.x,
      gem.y + size / 2
    );

    ctx.lineTo(
      gem.x - size / 2,
      gem.y
    );

    ctx.closePath();

    ctx.fill();
  }
}

private drawBoss(enemy: Enemy) {
  const x = enemy.x;
  const y = enemy.y;

  // body
  this.ctx.fillStyle = "#7f1d1d";

  this.ctx.fillRect(
    x - enemy.size / 2,
    y - enemy.size / 2,
    enemy.size,
    enemy.size
  );

  // horns
  this.ctx.fillStyle = "#fef2f2";

  this.ctx.fillRect(
    x - 30,
    y - 45,
    10,
    20
  );

  this.ctx.fillRect(
    x + 20,
    y - 45,
    10,
    20
  );

  // eyes
  this.ctx.fillStyle = "#facc15";

  this.ctx.fillRect(
    x - 18,
    y - 10,
    8,
    8
  );

  this.ctx.fillRect(
    x + 10,
    y - 10,
    8,
    8
  );
}

private drawBossHealthBar(enemy: Enemy) {
  const barWidth = 300;
  const barHeight = 14;

  const x =
    this.canvas.width / 2 -
    barWidth / 2;

  const y = 20;

  const hpPercent = Math.max(
    0,
    enemy.hp / enemy.maxHp
  );

  this.ctx.fillStyle = "#18181b";

  this.ctx.fillRect(
    x,
    y,
    barWidth,
    barHeight
  );

  this.ctx.fillStyle = "#dc2626";

  this.ctx.fillRect(
    x,
    y,
    barWidth * hpPercent,
    barHeight
  );

  this.ctx.fillStyle = "#ffffff";

  this.ctx.font = "14px monospace";

  this.ctx.textAlign = "center";

  this.ctx.fillText(
    "BOSS",
    this.canvas.width / 2,
    y + 11
  );

  this.ctx.textAlign = "left";
}

private drawEnemies() {
  for (const enemy of this.enemies) {
    switch (enemy.type) {
      case "goblin":
        this.drawGoblin(enemy);
        break;

      case "demon":
        this.drawDemon(enemy);
        break;

      case "brute":
        this.drawBrute(enemy);
        break;

      case "boss":
        this.drawBoss(enemy);
        break;
    }

    if (enemy.type === "boss") {
      this.drawBossHealthBar(enemy);
    } else {
      this.drawEnemyHealthBar(enemy);
    }

    this.drawEnemyHealthBar(enemy);
  }
}

private drawGoblin(enemy: Enemy) {
  this.ctx.fillStyle = "#65a30d";

  this.ctx.fillRect(
    enemy.x - 8,
    enemy.y - 8,
    16,
    16
  );

  this.ctx.fillStyle = "#ffffff";

  this.ctx.fillRect(
    enemy.x - 5,
    enemy.y - 3,
    3,
    3
  );

  this.ctx.fillRect(
    enemy.x + 2,
    enemy.y - 3,
    3,
    3
  );
}

private drawDemon(enemy: Enemy) {
  this.ctx.fillStyle = "#dc2626";

  this.ctx.fillRect(
    enemy.x - 10,
    enemy.y - 10,
    20,
    20
  );

  // horns
  this.ctx.fillRect(
    enemy.x - 10,
    enemy.y - 14,
    5,
    5
  );

  this.ctx.fillRect(
    enemy.x + 5,
    enemy.y - 14,
    5,
    5
  );

  // eyes
  this.ctx.fillStyle = "#facc15";

  this.ctx.fillRect(
    enemy.x - 5,
    enemy.y - 3,
    3,
    3
  );

  this.ctx.fillRect(
    enemy.x + 2,
    enemy.y - 3,
    3,
    3
  );
}

private drawBrute(enemy: Enemy) {
  this.ctx.fillStyle = "#7c3aed";

  this.ctx.fillRect(
    enemy.x - 14,
    enemy.y - 14,
    28,
    28
  );

  this.ctx.fillStyle = "#fef08a";

  this.ctx.fillRect(
    enemy.x - 7,
    enemy.y - 4,
    4,
    4
  );

  this.ctx.fillRect(
    enemy.x + 3,
    enemy.y - 4,
    4,
    4
  );
}

private drawEnemyHealthBar(enemy: Enemy) {
  const barWidth = enemy.size + 4;
  const barHeight = 3;

  const x = enemy.x - barWidth / 2;
  const y = enemy.y - enemy.size / 2 - 7;

  const hpPercent =
    Math.max(0, enemy.hp / enemy.maxHp);

  this.ctx.fillStyle = "#3f3f46";

  this.ctx.fillRect(
    x,
    y,
    barWidth,
    barHeight
  );

  this.ctx.fillStyle = "#ef4444";

  this.ctx.fillRect(
    x,
    y,
    barWidth * hpPercent,
    barHeight
  );
}

private drawLoot() {
  for (const item of this.loot) {
    switch (item.type) {
      case "healthPotion":
        this.ctx.fillStyle = "#ef4444";
        this.ctx.fillRect(
          item.x - 6,
          item.y - 8,
          12,
          16
        );

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(
          item.x - 2,
          item.y - 5,
          4,
          10
        );

        this.ctx.fillRect(
          item.x - 5,
          item.y - 2,
          10,
          4
        );
        break;

      case "gold":
        this.ctx.fillStyle = "#facc15";
        this.ctx.fillRect(
          item.x - 7,
          item.y - 7,
          14,
          14
        );
        break;

      case "damageBoost":
        this.ctx.fillStyle = "#f97316";
        this.ctx.fillRect(
          item.x - 7,
          item.y - 7,
          14,
          14
        );

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(
          item.x - 2,
          item.y - 6,
          4,
          12
        );
        break;

      case "attackSpeed":
        this.ctx.fillStyle = "#38bdf8";
        this.ctx.fillRect(
          item.x - 7,
          item.y - 7,
          14,
          14
        );

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(
          item.x - 2,
          item.y - 6,
          4,
          12
        );
        break;
    }
  }
}

private drawUI() {
  const { ctx } = this;

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px monospace";

  ctx.fillText(
    `LEVEL ${this.playerLevel}`,
    20,
    30
  );

  ctx.fillText(
    `XP ${this.playerExperience} / ${this.experienceToNextLevel}`,
    20,
    55
  );

  // XP bar
  const barWidth = 250;
  const barHeight = 14;

  const progress =
    this.playerExperience /
    this.experienceToNextLevel;

  ctx.fillStyle = "#374151";

  ctx.fillRect(
    20,
    70,
    barWidth,
    barHeight
  );

  ctx.fillStyle = "#22d3ee";

  ctx.fillRect(
    20,
    70,
    barWidth * progress,
    barHeight
  );

this.ctx.fillStyle = "#ffffff";
this.ctx.font = "16px monospace";

this.ctx.fillText(
  `HP: ${Math.ceil(this.playerStats.hp)} / ${this.playerStats.maxHp}`,
  20,
  85
);

  this.ctx.fillText(
  `Gold: ${this.playerGold}`,
  20,
  110
);

this.ctx.fillText(
  `Damage: ${this.playerStats.damage.toFixed(1)}`,
  20,
  135
);

let weaponY = 160;

for (const weapon of this.weapons) {
  this.ctx.fillStyle = weapon.projectileColor;

  this.ctx.fillText(
    `${weapon.type} Lv.${weapon.level}`,
    20,
    weaponY
  );

  weaponY += 20;
}

const levelConfig = this.getCurrentLevelConfig();

this.ctx.fillStyle = "#ffffff";
this.ctx.font = "16px monospace";

this.ctx.fillText(
  `Level: ${this.currentLevel} - ${levelConfig.name}`,
  20,
  25
);

const remainingTime = Math.max(
  0,
  Math.ceil(levelConfig.duration - this.levelTime)
);

this.ctx.fillText(
  `Time: ${remainingTime}s`,
  20,
  45
);


}

  private render() {
    const { ctx } = this;

    // Фон
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Сетка
    this.drawGrid();
    this.drawExperienceGems();
    this.drawLoot();
    this.checkLevelUp();
    this.drawEnemies();
    this.drawPlayer();
    this.drawPlayerHealthBar();
    this.drawProjectiles();
    this.drawUI();
  }

  private drawGrid() {
    const { ctx } = this;

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;

    const gridSize = 32;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  private drawPlayer() {
    const { ctx } = this;

    const size = this.player.size;
    const x = this.player.x;
    const y = this.player.y;

    // Тело
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(
      x - size / 2,
      y - size / 2,
      size,
      size
    );

    // Волосы
    ctx.fillStyle = "#facc15";
    ctx.fillRect(
      x - size / 2,
      y - size / 2,
      size,
      7
    );

    // Глаза
    ctx.fillStyle = "#111827";

    ctx.fillRect(x - 6, y - 4, 3, 3);
    ctx.fillRect(x + 3, y - 4, 3, 3);
  }

  private drawPlayerHealthBar() {
  const barWidth = 40;
  const barHeight = 5;

  const x = this.player.x - barWidth / 2;
  const y = this.player.y - this.player.size / 2 - 12;

  const hpPercent =
    this.playerStats.hp / this.playerStats.maxHp;

  // Background
  this.ctx.fillStyle = "#3f3f46";
  this.ctx.fillRect(
    x,
    y,
    barWidth,
    barHeight
  );

  // Current HP
  if (hpPercent > 0.6) {
  this.ctx.fillStyle = "#22c55e";
} else if (hpPercent > 0.3) {
  this.ctx.fillStyle = "#eab308";
} else {
  this.ctx.fillStyle = "#ef4444";
}
  this.ctx.fillRect(
    x,
    y,
    barWidth * hpPercent,
    barHeight
  );
}

  public destroy() {
    cancelAnimationFrame(this.animationFrame);

    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.resize);
  }
}

