// ============================================================
// Creature Defense Tycoon - Core Type Definitions
// ============================================================

/** Rebirth phase determines biome, enemies, and difficulty */
export type RebirthPhase = 0 | 1 | 2 | 3;

/** Moon type per rebirth phase */
export type MoonType = "normal" | "full" | "eclipse" | "blood";

/** Enemy categories */
export type EnemyType =
  | "zombie_green"
  | "zombie_blue"
  | "zombie_red"
  | "zombie_giant"
  | "zombie_boss"
  | "werewolf"
  | "werewolf_alpha"
  | "werewolf_boss";

/** Weapon categories */
export type WeaponType =
  | "bat"
  | "spiked_bat"
  | "crossbow"
  | "shotgun"
  | "rifle"
  | "minigun"
  | "rocket_launcher"
  | "silver_sword"
  | "holy_crossbow"
  | "magic_staff";

/** Auto-weapon (turret) categories */
export type TurretType =
  | "basic_turret"
  | "laser_turret"
  | "artillery"
  | "silver_turret"
  | "holy_cannon";

/** Fortification types */
export type FortificationType =
  | "wooden_fence"
  | "stone_wall"
  | "watchtower"
  | "fort"
  | "castle"
  | "mega_fortress";

/** Core game state */
export interface GameState {
  phase: RebirthPhase;
  wave: number;
  coins: number;
  playerHealth: number;
  playerMaxHealth: number;
  equippedWeapon: WeaponType | null;
  ownedWeapons: WeaponType[];
  placedTurrets: PlacedTurret[];
  fortifications: PlacedFortification[];
  enemiesAlive: number;
  bossDefeated: boolean;
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
}

export interface EnemyConfig {
  type: EnemyType;
  health: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  coinDrop: [min: number, max: number];
  color: string;
  scale: number;
}

export interface WeaponConfig {
  type: WeaponType;
  cost: number;
  damage: number;
  attackSpeed: number;
  range: number;
  isRanged: boolean;
  projectileSpeed?: number;
  aoeRadius?: number;
  unlockedAtPhase: RebirthPhase;
}

export interface TurretConfig {
  type: TurretType;
  cost: number;
  damage: number;
  attackSpeed: number;
  range: number;
  unlockedAtPhase: RebirthPhase;
}

export interface FortificationConfig {
  type: FortificationType;
  cost: number;
  health: number;
  unlockedAtPhase: RebirthPhase;
}

export interface PlacedTurret {
  id: string;
  type: TurretType;
  position: [x: number, y: number, z: number];
  health: number;
}

export interface PlacedFortification {
  id: string;
  type: FortificationType;
  position: [x: number, y: number, z: number];
  health: number;
}

export interface WaveConfig {
  waveNumber: number;
  enemies: Array<{
    type: EnemyType;
    count: number;
    spawnDelay: number;
  }>;
  bonusCoins: number;
}
