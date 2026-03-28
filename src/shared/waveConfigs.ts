import type { WaveConfig } from "./types";

/**
 * Phase 0 Wave Configurations (Waves 1-30)
 *
 * Scaled for large round world (radius 80). High enemy counts, fast spawns.
 * Spawn bias: 60% near clearing, 30% mid-range, 10% far.
 */

export const WAVE_CONFIGS: WaveConfig[] = [
  // WAVES 1-5: TUTORIAL
  {
    waveNumber: 1,
    enemies: [{ type: "zombie_green", count: 8, spawnDelay: 1.5 }],
    bonusCoins: 50,
  },
  {
    waveNumber: 2,
    enemies: [{ type: "zombie_green", count: 12, spawnDelay: 1.2 }],
    bonusCoins: 100,
  },
  {
    waveNumber: 3,
    enemies: [{ type: "zombie_green", count: 16, spawnDelay: 1.0 }],
    bonusCoins: 150,
  },
  {
    waveNumber: 4,
    enemies: [{ type: "zombie_green", count: 20, spawnDelay: 1.0 }],
    bonusCoins: 200,
  },
  {
    waveNumber: 5,
    enemies: [{ type: "zombie_green", count: 28, spawnDelay: 0.8 }],
    bonusCoins: 300,
  },

  // WAVES 6-9: SPEED CHALLENGE
  {
    waveNumber: 6,
    enemies: [
      { type: "zombie_green", count: 20, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 8, spawnDelay: 0.8 },
    ],
    bonusCoins: 300,
  },
  {
    waveNumber: 7,
    enemies: [
      { type: "zombie_green", count: 16, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 12, spawnDelay: 0.7 },
    ],
    bonusCoins: 350,
  },
  {
    waveNumber: 8,
    enemies: [
      { type: "zombie_green", count: 16, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 20, spawnDelay: 0.5 },
    ],
    bonusCoins: 400,
  },
  {
    waveNumber: 9,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 24, spawnDelay: 0.5 },
    ],
    bonusCoins: 450,
  },

  // WAVE 10: FIRST MINIBOSS
  {
    waveNumber: 10,
    enemies: [
      { type: "zombie_giant", count: 1, spawnDelay: 0.5 },
      { type: "zombie_green", count: 20, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 12, spawnDelay: 0.7 },
    ],
    bonusCoins: 500,
  },

  // WAVES 11-14: TANK CHALLENGE
  {
    waveNumber: 11,
    enemies: [
      { type: "zombie_green", count: 16, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 12, spawnDelay: 0.7 },
      { type: "zombie_red", count: 8, spawnDelay: 1.5 },
    ],
    bonusCoins: 500,
  },
  {
    waveNumber: 12,
    enemies: [
      { type: "zombie_green", count: 16, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 16, spawnDelay: 0.7 },
      { type: "zombie_red", count: 10, spawnDelay: 1.2 },
    ],
    bonusCoins: 600,
  },
  {
    waveNumber: 13,
    enemies: [
      { type: "zombie_green", count: 20, spawnDelay: 0.8 },
      { type: "zombie_blue", count: 20, spawnDelay: 0.6 },
      { type: "zombie_red", count: 12, spawnDelay: 1.0 },
    ],
    bonusCoins: 650,
  },
  {
    waveNumber: 14,
    enemies: [
      { type: "zombie_green", count: 16, spawnDelay: 1.0 },
      { type: "zombie_blue", count: 16, spawnDelay: 0.7 },
      { type: "zombie_red", count: 16, spawnDelay: 1.0 },
    ],
    bonusCoins: 700,
  },

  // WAVE 15: SECOND MINIBOSS
  {
    waveNumber: 15,
    enemies: [
      { type: "zombie_giant", count: 2, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 20, spawnDelay: 0.5 },
      { type: "zombie_red", count: 12, spawnDelay: 1.0 },
    ],
    bonusCoins: 750,
  },

  // WAVES 16-19: ESCALATION
  {
    waveNumber: 16,
    enemies: [
      { type: "zombie_green", count: 28, spawnDelay: 0.7 },
      { type: "zombie_blue", count: 20, spawnDelay: 0.5 },
      { type: "zombie_red", count: 12, spawnDelay: 1.0 },
    ],
    bonusCoins: 800,
  },
  {
    waveNumber: 17,
    enemies: [
      { type: "zombie_green", count: 20, spawnDelay: 0.7 },
      { type: "zombie_blue", count: 28, spawnDelay: 0.5 },
      { type: "zombie_red", count: 16, spawnDelay: 0.8 },
    ],
    bonusCoins: 850,
  },
  {
    waveNumber: 18,
    enemies: [
      { type: "zombie_green", count: 32, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 24, spawnDelay: 0.5 },
      { type: "zombie_red", count: 16, spawnDelay: 0.8 },
    ],
    bonusCoins: 900,
  },
  {
    waveNumber: 19,
    enemies: [
      { type: "zombie_green", count: 24, spawnDelay: 0.7 },
      { type: "zombie_blue", count: 32, spawnDelay: 0.4 },
      { type: "zombie_red", count: 20, spawnDelay: 0.7 },
    ],
    bonusCoins: 950,
  },

  // WAVE 20: THIRD MINIBOSS
  {
    waveNumber: 20,
    enemies: [
      { type: "zombie_giant", count: 2, spawnDelay: 0.5 },
      { type: "zombie_green", count: 20, spawnDelay: 0.7 },
      { type: "zombie_red", count: 24, spawnDelay: 0.7 },
    ],
    bonusCoins: 1000,
  },

  // WAVES 21-24: PRESSURE
  {
    waveNumber: 21,
    enemies: [
      { type: "zombie_green", count: 32, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 28, spawnDelay: 0.4 },
      { type: "zombie_red", count: 20, spawnDelay: 0.7 },
    ],
    bonusCoins: 1050,
  },
  {
    waveNumber: 22,
    enemies: [
      { type: "zombie_green", count: 28, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 36, spawnDelay: 0.4 },
      { type: "zombie_red", count: 24, spawnDelay: 0.7 },
    ],
    bonusCoins: 1100,
  },
  {
    waveNumber: 23,
    enemies: [
      { type: "zombie_green", count: 36, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 32, spawnDelay: 0.4 },
      { type: "zombie_red", count: 24, spawnDelay: 0.7 },
    ],
    bonusCoins: 1150,
  },
  {
    waveNumber: 24,
    enemies: [
      { type: "zombie_green", count: 32, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 36, spawnDelay: 0.3 },
      { type: "zombie_red", count: 28, spawnDelay: 0.6 },
    ],
    bonusCoins: 1200,
  },

  // WAVE 25: FOURTH MINIBOSS
  {
    waveNumber: 25,
    enemies: [
      { type: "zombie_giant", count: 4, spawnDelay: 0.5 },
      { type: "zombie_green", count: 28, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 28, spawnDelay: 0.4 },
      { type: "zombie_red", count: 24, spawnDelay: 0.7 },
    ],
    bonusCoins: 1250,
  },

  // WAVES 26-29: PRE-BOSS GAUNTLET
  {
    waveNumber: 26,
    enemies: [
      { type: "zombie_green", count: 36, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 40, spawnDelay: 0.3 },
      { type: "zombie_red", count: 28, spawnDelay: 0.6 },
    ],
    bonusCoins: 1300,
  },
  {
    waveNumber: 27,
    enemies: [
      { type: "zombie_green", count: 40, spawnDelay: 0.4 },
      { type: "zombie_blue", count: 36, spawnDelay: 0.3 },
      { type: "zombie_red", count: 32, spawnDelay: 0.5 },
    ],
    bonusCoins: 1350,
  },
  {
    waveNumber: 28,
    enemies: [
      { type: "zombie_giant", count: 4, spawnDelay: 0.5 },
      { type: "zombie_green", count: 32, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 40, spawnDelay: 0.3 },
      { type: "zombie_red", count: 28, spawnDelay: 0.6 },
    ],
    bonusCoins: 1400,
  },
  {
    waveNumber: 29,
    enemies: [
      { type: "zombie_green", count: 44, spawnDelay: 0.3 },
      { type: "zombie_blue", count: 44, spawnDelay: 0.3 },
      { type: "zombie_red", count: 36, spawnDelay: 0.5 },
    ],
    bonusCoins: 1450,
  },

  // WAVE 30: BOSS FINALE
  {
    waveNumber: 30,
    enemies: [
      { type: "zombie_boss", count: 1, spawnDelay: 1.0 },
      { type: "zombie_green", count: 12, spawnDelay: 1.0 },
      { type: "zombie_red", count: 8, spawnDelay: 1.0 },
    ],
    bonusCoins: 1500,
  },
];
