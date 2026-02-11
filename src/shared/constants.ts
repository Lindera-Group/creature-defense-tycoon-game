import type {
  EnemyConfig,
  WeaponConfig,
  TurretConfig,
  FortificationConfig,
  MoonType,
  RebirthPhase,
} from "./types";

// ============================================================
// Phase Configuration
// ============================================================

export const PHASE_CONFIG: Record<
  RebirthPhase,
  { moon: MoonType; coinMultiplier: number; name: string }
> = {
  0: { moon: "normal", coinMultiplier: 1, name: "Dark Forest" },
  1: { moon: "full", coinMultiplier: 2, name: "Full Moon Forest" },
  2: { moon: "eclipse", coinMultiplier: 4, name: "Cursed Forest" },
  3: { moon: "blood", coinMultiplier: 8, name: "Blood Moon Forest" },
};

export const MAX_WAVES_PER_PHASE = 30;
export const BOSS_WAVE = 30;
export const MINIBOSS_WAVES = [10, 15, 20, 25];

// ============================================================
// Enemy Configurations
// ============================================================

export const ENEMIES: Record<string, EnemyConfig> = {
  zombie_green: {
    type: "zombie_green",
    health: 30,
    speed: 1.5,
    damage: 5,
    attackSpeed: 1,
    coinDrop: [5, 10],
    color: "#4CAF50",
    scale: 1,
  },
  zombie_blue: {
    type: "zombie_blue",
    health: 20,
    speed: 3.0,
    damage: 8,
    attackSpeed: 1.5,
    coinDrop: [15, 25],
    color: "#2196F3",
    scale: 0.9,
  },
  zombie_red: {
    type: "zombie_red",
    health: 80,
    speed: 1.0,
    damage: 20,
    attackSpeed: 0.8,
    coinDrop: [30, 50],
    color: "#F44336",
    scale: 1.3,
  },
  zombie_giant: {
    type: "zombie_giant",
    health: 300,
    speed: 0.8,
    damage: 40,
    attackSpeed: 0.5,
    coinDrop: [200, 500],
    color: "#9C27B0",
    scale: 3,
  },
  zombie_boss: {
    type: "zombie_boss",
    health: 2000,
    speed: 0.5,
    damage: 80,
    attackSpeed: 0.3,
    coinDrop: [2000, 2000],
    color: "#1B0A1A",
    scale: 8, // ~12 meters tall
  },
  werewolf: {
    type: "werewolf",
    health: 60,
    speed: 4.0,
    damage: 15,
    attackSpeed: 2,
    coinDrop: [20, 40],
    color: "#795548",
    scale: 1.2,
  },
  werewolf_alpha: {
    type: "werewolf_alpha",
    health: 500,
    speed: 3.0,
    damage: 50,
    attackSpeed: 1.5,
    coinDrop: [300, 600],
    color: "#4E342E",
    scale: 3.5,
  },
  werewolf_boss: {
    type: "werewolf_boss",
    health: 3000,
    speed: 2.0,
    damage: 100,
    attackSpeed: 1,
    coinDrop: [3000, 3000],
    color: "#212121",
    scale: 9,
  },
};

// ============================================================
// Weapon Configurations
// ============================================================

export const WEAPONS: Record<string, WeaponConfig> = {
  bat: {
    type: "bat",
    cost: 0,
    damage: 10,
    attackSpeed: 2,
    range: 2,
    isRanged: false,
    unlockedAtPhase: 0,
  },
  spiked_bat: {
    type: "spiked_bat",
    cost: 100,
    damage: 20,
    attackSpeed: 2,
    range: 2.5,
    isRanged: false,
    unlockedAtPhase: 0,
  },
  crossbow: {
    type: "crossbow",
    cost: 300,
    damage: 30,
    attackSpeed: 1,
    range: 20,
    isRanged: true,
    projectileSpeed: 15,
    unlockedAtPhase: 0,
  },
  shotgun: {
    type: "shotgun",
    cost: 800,
    damage: 50,
    attackSpeed: 0.8,
    range: 10,
    isRanged: true,
    projectileSpeed: 25,
    aoeRadius: 3,
    unlockedAtPhase: 0,
  },
  rifle: {
    type: "rifle",
    cost: 1500,
    damage: 40,
    attackSpeed: 3,
    range: 40,
    isRanged: true,
    projectileSpeed: 40,
    unlockedAtPhase: 0,
  },
  minigun: {
    type: "minigun",
    cost: 3000,
    damage: 15,
    attackSpeed: 10,
    range: 25,
    isRanged: true,
    projectileSpeed: 30,
    unlockedAtPhase: 0,
  },
  rocket_launcher: {
    type: "rocket_launcher",
    cost: 5000,
    damage: 150,
    attackSpeed: 0.5,
    range: 30,
    isRanged: true,
    projectileSpeed: 12,
    aoeRadius: 5,
    unlockedAtPhase: 0,
  },
  silver_sword: {
    type: "silver_sword",
    cost: 2000,
    damage: 60,
    attackSpeed: 3,
    range: 3,
    isRanged: false,
    unlockedAtPhase: 1,
  },
  holy_crossbow: {
    type: "holy_crossbow",
    cost: 4000,
    damage: 80,
    attackSpeed: 1.5,
    range: 25,
    isRanged: true,
    projectileSpeed: 20,
    unlockedAtPhase: 2,
  },
  magic_staff: {
    type: "magic_staff",
    cost: 8000,
    damage: 100,
    attackSpeed: 2,
    range: 30,
    isRanged: true,
    projectileSpeed: 18,
    aoeRadius: 4,
    unlockedAtPhase: 3,
  },
};

// ============================================================
// Turret Configurations
// ============================================================

export const TURRETS: Record<string, TurretConfig> = {
  basic_turret: {
    type: "basic_turret",
    cost: 500,
    damage: 15,
    attackSpeed: 2,
    range: 15,
    unlockedAtPhase: 0,
  },
  laser_turret: {
    type: "laser_turret",
    cost: 2000,
    damage: 40,
    attackSpeed: 3,
    range: 25,
    unlockedAtPhase: 0,
  },
  artillery: {
    type: "artillery",
    cost: 5000,
    damage: 100,
    attackSpeed: 0.5,
    range: 40,
    unlockedAtPhase: 0,
  },
  silver_turret: {
    type: "silver_turret",
    cost: 3000,
    damage: 50,
    attackSpeed: 2,
    range: 20,
    unlockedAtPhase: 1,
  },
  holy_cannon: {
    type: "holy_cannon",
    cost: 8000,
    damage: 120,
    attackSpeed: 1,
    range: 35,
    unlockedAtPhase: 2,
  },
};

// ============================================================
// Fortification Configurations
// ============================================================

export const FORTIFICATIONS: Record<string, FortificationConfig> = {
  wooden_fence: {
    type: "wooden_fence",
    cost: 50,
    health: 100,
    unlockedAtPhase: 0,
  },
  stone_wall: {
    type: "stone_wall",
    cost: 200,
    health: 500,
    unlockedAtPhase: 0,
  },
  watchtower: {
    type: "watchtower",
    cost: 500,
    health: 300,
    unlockedAtPhase: 0,
  },
  fort: {
    type: "fort",
    cost: 2000,
    health: 2000,
    unlockedAtPhase: 0,
  },
  castle: {
    type: "castle",
    cost: 5000,
    health: 5000,
    unlockedAtPhase: 1,
  },
  mega_fortress: {
    type: "mega_fortress",
    cost: 10000,
    health: 10000,
    unlockedAtPhase: 2,
  },
};

// ============================================================
// Player Defaults
// ============================================================

export const PLAYER_DEFAULTS = {
  health: 100,
  speed: 5,
  startingCoins: 0,
} as const;
