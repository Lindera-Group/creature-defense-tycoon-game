import type { WaveConfig, RebirthPhase } from "./types";

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

// ============================================================
// Phase 1 — Full Moon: Werewolves (faster, higher health)
// Same structural pattern as phase 0, werewolf types substituted.
// ============================================================

const PHASE_1_CONFIGS: WaveConfig[] = [
  // WAVES 1-5: TUTORIAL
  {
    waveNumber: 1,
    enemies: [{ type: "werewolf", count: 8, spawnDelay: 1.3 }],
    bonusCoins: 100,
  },
  {
    waveNumber: 2,
    enemies: [{ type: "werewolf", count: 12, spawnDelay: 1.1 }],
    bonusCoins: 200,
  },
  {
    waveNumber: 3,
    enemies: [{ type: "werewolf", count: 16, spawnDelay: 0.9 }],
    bonusCoins: 300,
  },
  {
    waveNumber: 4,
    enemies: [{ type: "werewolf", count: 20, spawnDelay: 0.9 }],
    bonusCoins: 400,
  },
  {
    waveNumber: 5,
    enemies: [{ type: "werewolf", count: 28, spawnDelay: 0.7 }],
    bonusCoins: 600,
  },

  // WAVES 6-9: SPEED CHALLENGE
  {
    waveNumber: 6,
    enemies: [
      { type: "werewolf", count: 20, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 8, spawnDelay: 0.7 },
    ],
    bonusCoins: 600,
  },
  {
    waveNumber: 7,
    enemies: [
      { type: "werewolf", count: 16, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 12, spawnDelay: 0.6 },
    ],
    bonusCoins: 700,
  },
  {
    waveNumber: 8,
    enemies: [
      { type: "werewolf", count: 16, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 20, spawnDelay: 0.5 },
    ],
    bonusCoins: 800,
  },
  {
    waveNumber: 9,
    enemies: [
      { type: "werewolf", count: 12, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 24, spawnDelay: 0.4 },
    ],
    bonusCoins: 900,
  },

  // WAVE 10: FIRST MINIBOSS
  {
    waveNumber: 10,
    enemies: [
      { type: "werewolf_giant", count: 1, spawnDelay: 0.5 },
      { type: "werewolf", count: 20, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 12, spawnDelay: 0.6 },
    ],
    bonusCoins: 1000,
  },

  // WAVES 11-14: TANK CHALLENGE
  {
    waveNumber: 11,
    enemies: [
      { type: "werewolf", count: 16, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 12, spawnDelay: 0.6 },
      { type: "werewolf_super", count: 8, spawnDelay: 1.3 },
    ],
    bonusCoins: 1000,
  },
  {
    waveNumber: 12,
    enemies: [
      { type: "werewolf", count: 16, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 16, spawnDelay: 0.6 },
      { type: "werewolf_super", count: 10, spawnDelay: 1.1 },
    ],
    bonusCoins: 1200,
  },
  {
    waveNumber: 13,
    enemies: [
      { type: "werewolf", count: 20, spawnDelay: 0.7 },
      { type: "werewolf_alpha", count: 20, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.9 },
    ],
    bonusCoins: 1300,
  },
  {
    waveNumber: 14,
    enemies: [
      { type: "werewolf", count: 16, spawnDelay: 0.9 },
      { type: "werewolf_alpha", count: 16, spawnDelay: 0.6 },
      { type: "werewolf_super", count: 16, spawnDelay: 0.9 },
    ],
    bonusCoins: 1400,
  },

  // WAVE 15: SECOND MINIBOSS
  {
    waveNumber: 15,
    enemies: [
      { type: "werewolf_giant", count: 2, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 20, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.9 },
    ],
    bonusCoins: 1500,
  },

  // WAVES 16-19: ESCALATION
  {
    waveNumber: 16,
    enemies: [
      { type: "werewolf", count: 28, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 20, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.9 },
    ],
    bonusCoins: 1600,
  },
  {
    waveNumber: 17,
    enemies: [
      { type: "werewolf", count: 20, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 28, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 16, spawnDelay: 0.7 },
    ],
    bonusCoins: 1700,
  },
  {
    waveNumber: 18,
    enemies: [
      { type: "werewolf", count: 32, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 24, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 16, spawnDelay: 0.7 },
    ],
    bonusCoins: 1800,
  },
  {
    waveNumber: 19,
    enemies: [
      { type: "werewolf", count: 24, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 32, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 20, spawnDelay: 0.6 },
    ],
    bonusCoins: 1900,
  },

  // WAVE 20: THIRD MINIBOSS
  {
    waveNumber: 20,
    enemies: [
      { type: "werewolf_giant", count: 2, spawnDelay: 0.5 },
      { type: "werewolf", count: 20, spawnDelay: 0.6 },
      { type: "werewolf_super", count: 24, spawnDelay: 0.6 },
    ],
    bonusCoins: 2000,
  },

  // WAVES 21-24: PRESSURE
  {
    waveNumber: 21,
    enemies: [
      { type: "werewolf", count: 32, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 28, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 20, spawnDelay: 0.6 },
    ],
    bonusCoins: 2100,
  },
  {
    waveNumber: 22,
    enemies: [
      { type: "werewolf", count: 28, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 36, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 24, spawnDelay: 0.6 },
    ],
    bonusCoins: 2200,
  },
  {
    waveNumber: 23,
    enemies: [
      { type: "werewolf", count: 36, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 32, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 24, spawnDelay: 0.6 },
    ],
    bonusCoins: 2300,
  },
  {
    waveNumber: 24,
    enemies: [
      { type: "werewolf", count: 32, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 36, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 28, spawnDelay: 0.5 },
    ],
    bonusCoins: 2400,
  },

  // WAVE 25: FOURTH MINIBOSS
  {
    waveNumber: 25,
    enemies: [
      { type: "werewolf_giant", count: 4, spawnDelay: 0.5 },
      { type: "werewolf", count: 28, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 28, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 24, spawnDelay: 0.6 },
    ],
    bonusCoins: 2500,
  },

  // WAVES 26-29: PRE-BOSS GAUNTLET
  {
    waveNumber: 26,
    enemies: [
      { type: "werewolf", count: 36, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 40, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 28, spawnDelay: 0.5 },
    ],
    bonusCoins: 2600,
  },
  {
    waveNumber: 27,
    enemies: [
      { type: "werewolf", count: 40, spawnDelay: 0.4 },
      { type: "werewolf_alpha", count: 36, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 32, spawnDelay: 0.5 },
    ],
    bonusCoins: 2700,
  },
  {
    waveNumber: 28,
    enemies: [
      { type: "werewolf_giant", count: 4, spawnDelay: 0.5 },
      { type: "werewolf", count: 32, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 40, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 28, spawnDelay: 0.5 },
    ],
    bonusCoins: 2800,
  },
  {
    waveNumber: 29,
    enemies: [
      { type: "werewolf", count: 44, spawnDelay: 0.3 },
      { type: "werewolf_alpha", count: 44, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 36, spawnDelay: 0.5 },
    ],
    bonusCoins: 2900,
  },

  // WAVE 30: BOSS FINALE
  {
    waveNumber: 30,
    enemies: [
      { type: "werewolf_boss", count: 1, spawnDelay: 1.0 },
      { type: "werewolf", count: 12, spawnDelay: 1.0 },
      { type: "werewolf_super", count: 8, spawnDelay: 1.0 },
    ],
    bonusCoins: 3000,
  },
];

// ============================================================
// Phase 2 — Eclipse: Enhanced creatures (same as phase 0, 2x counts)
// ============================================================

const PHASE_2_CONFIGS: WaveConfig[] = WAVE_CONFIGS.map((w) => ({
  waveNumber: w.waveNumber,
  enemies: w.enemies.map((e) => ({
    type: e.type,
    count: Math.round(e.count * 2),
    spawnDelay: Math.max(0.2, e.spawnDelay * 0.8),
  })),
  bonusCoins: w.bonusCoins * 4,
}));

// ============================================================
// Phase 3 — Blood Moon: All types mixed, 1.5x phase-0 counts
// Zombies and werewolves together in every wave.
// ============================================================

const PHASE_3_CONFIGS: WaveConfig[] = [
  // WAVES 1-5: TUTORIAL
  {
    waveNumber: 1,
    enemies: [
      { type: "zombie_green", count: 6, spawnDelay: 1.2 },
      { type: "werewolf", count: 6, spawnDelay: 1.0 },
    ],
    bonusCoins: 400,
  },
  {
    waveNumber: 2,
    enemies: [
      { type: "zombie_green", count: 9, spawnDelay: 1.0 },
      { type: "werewolf", count: 9, spawnDelay: 0.9 },
    ],
    bonusCoins: 800,
  },
  {
    waveNumber: 3,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
    ],
    bonusCoins: 1200,
  },
  {
    waveNumber: 4,
    enemies: [
      { type: "zombie_green", count: 15, spawnDelay: 0.9 },
      { type: "werewolf", count: 15, spawnDelay: 0.8 },
    ],
    bonusCoins: 1600,
  },
  {
    waveNumber: 5,
    enemies: [
      { type: "zombie_green", count: 21, spawnDelay: 0.7 },
      { type: "werewolf", count: 21, spawnDelay: 0.6 },
    ],
    bonusCoins: 2400,
  },

  // WAVES 6-9: SPEED CHALLENGE
  {
    waveNumber: 6,
    enemies: [
      { type: "zombie_green", count: 15, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 6, spawnDelay: 0.7 },
      { type: "werewolf", count: 15, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 6, spawnDelay: 0.6 },
    ],
    bonusCoins: 2400,
  },
  {
    waveNumber: 7,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 9, spawnDelay: 0.6 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 9, spawnDelay: 0.5 },
    ],
    bonusCoins: 2800,
  },
  {
    waveNumber: 8,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 15, spawnDelay: 0.5 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 15, spawnDelay: 0.4 },
    ],
    bonusCoins: 3200,
  },
  {
    waveNumber: 9,
    enemies: [
      { type: "zombie_green", count: 9, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 18, spawnDelay: 0.4 },
      { type: "werewolf", count: 9, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 18, spawnDelay: 0.4 },
    ],
    bonusCoins: 3600,
  },

  // WAVE 10: FIRST MINIBOSS
  {
    waveNumber: 10,
    enemies: [
      { type: "zombie_giant", count: 1, spawnDelay: 0.5 },
      { type: "werewolf_giant", count: 1, spawnDelay: 0.5 },
      { type: "zombie_green", count: 15, spawnDelay: 0.9 },
      { type: "werewolf", count: 15, spawnDelay: 0.8 },
    ],
    bonusCoins: 4000,
  },

  // WAVES 11-14: TANK CHALLENGE
  {
    waveNumber: 11,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 9, spawnDelay: 0.6 },
      { type: "zombie_red", count: 6, spawnDelay: 1.3 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 9, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 6, spawnDelay: 1.2 },
    ],
    bonusCoins: 4000,
  },
  {
    waveNumber: 12,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 12, spawnDelay: 0.6 },
      { type: "zombie_red", count: 8, spawnDelay: 1.1 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 12, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 8, spawnDelay: 1.0 },
    ],
    bonusCoins: 4800,
  },
  {
    waveNumber: 13,
    enemies: [
      { type: "zombie_green", count: 15, spawnDelay: 0.7 },
      { type: "zombie_blue", count: 15, spawnDelay: 0.5 },
      { type: "zombie_red", count: 9, spawnDelay: 0.9 },
      { type: "werewolf", count: 15, spawnDelay: 0.7 },
      { type: "werewolf_alpha", count: 15, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 9, spawnDelay: 0.8 },
    ],
    bonusCoins: 5200,
  },
  {
    waveNumber: 14,
    enemies: [
      { type: "zombie_green", count: 12, spawnDelay: 0.9 },
      { type: "zombie_blue", count: 12, spawnDelay: 0.6 },
      { type: "zombie_red", count: 12, spawnDelay: 0.9 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "werewolf_alpha", count: 12, spawnDelay: 0.5 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.8 },
    ],
    bonusCoins: 5600,
  },

  // WAVE 15: SECOND MINIBOSS
  {
    waveNumber: 15,
    enemies: [
      { type: "zombie_giant", count: 2, spawnDelay: 0.5 },
      { type: "werewolf_giant", count: 2, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 15, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 15, spawnDelay: 0.4 },
    ],
    bonusCoins: 6000,
  },

  // WAVES 16-19: ESCALATION
  {
    waveNumber: 16,
    enemies: [
      { type: "zombie_green", count: 21, spawnDelay: 0.6 },
      { type: "zombie_blue", count: 15, spawnDelay: 0.5 },
      { type: "zombie_red", count: 9, spawnDelay: 0.9 },
      { type: "werewolf", count: 21, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 15, spawnDelay: 0.4 },
    ],
    bonusCoins: 6400,
  },
  {
    waveNumber: 17,
    enemies: [
      { type: "zombie_green", count: 15, spawnDelay: 0.6 },
      { type: "zombie_blue", count: 21, spawnDelay: 0.4 },
      { type: "zombie_red", count: 12, spawnDelay: 0.7 },
      { type: "werewolf", count: 15, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 21, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.7 },
    ],
    bonusCoins: 6800,
  },
  {
    waveNumber: 18,
    enemies: [
      { type: "zombie_green", count: 24, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 18, spawnDelay: 0.4 },
      { type: "zombie_red", count: 12, spawnDelay: 0.7 },
      { type: "werewolf", count: 24, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 18, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 12, spawnDelay: 0.7 },
    ],
    bonusCoins: 7200,
  },
  {
    waveNumber: 19,
    enemies: [
      { type: "zombie_green", count: 18, spawnDelay: 0.6 },
      { type: "zombie_blue", count: 24, spawnDelay: 0.3 },
      { type: "zombie_red", count: 15, spawnDelay: 0.6 },
      { type: "werewolf", count: 18, spawnDelay: 0.6 },
      { type: "werewolf_alpha", count: 24, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 15, spawnDelay: 0.6 },
    ],
    bonusCoins: 7600,
  },

  // WAVE 20: THIRD MINIBOSS
  {
    waveNumber: 20,
    enemies: [
      { type: "zombie_giant", count: 2, spawnDelay: 0.5 },
      { type: "werewolf_giant", count: 2, spawnDelay: 0.5 },
      { type: "zombie_green", count: 15, spawnDelay: 0.6 },
      { type: "zombie_red", count: 18, spawnDelay: 0.6 },
      { type: "werewolf", count: 15, spawnDelay: 0.6 },
      { type: "werewolf_super", count: 18, spawnDelay: 0.6 },
    ],
    bonusCoins: 8000,
  },

  // WAVES 21-24: PRESSURE
  {
    waveNumber: 21,
    enemies: [
      { type: "zombie_green", count: 24, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 21, spawnDelay: 0.4 },
      { type: "zombie_red", count: 15, spawnDelay: 0.6 },
      { type: "werewolf", count: 24, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 21, spawnDelay: 0.4 },
      { type: "werewolf_super", count: 15, spawnDelay: 0.6 },
    ],
    bonusCoins: 8400,
  },
  {
    waveNumber: 22,
    enemies: [
      { type: "zombie_green", count: 21, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 27, spawnDelay: 0.3 },
      { type: "zombie_red", count: 18, spawnDelay: 0.6 },
      { type: "werewolf", count: 21, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 27, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 18, spawnDelay: 0.6 },
    ],
    bonusCoins: 8800,
  },
  {
    waveNumber: 23,
    enemies: [
      { type: "zombie_green", count: 27, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 24, spawnDelay: 0.3 },
      { type: "zombie_red", count: 18, spawnDelay: 0.6 },
      { type: "werewolf", count: 27, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 24, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 18, spawnDelay: 0.6 },
    ],
    bonusCoins: 9200,
  },
  {
    waveNumber: 24,
    enemies: [
      { type: "zombie_green", count: 24, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 27, spawnDelay: 0.3 },
      { type: "zombie_red", count: 21, spawnDelay: 0.5 },
      { type: "werewolf", count: 24, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 27, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 21, spawnDelay: 0.5 },
    ],
    bonusCoins: 9600,
  },

  // WAVE 25: FOURTH MINIBOSS
  {
    waveNumber: 25,
    enemies: [
      { type: "zombie_giant", count: 3, spawnDelay: 0.5 },
      { type: "werewolf_giant", count: 3, spawnDelay: 0.5 },
      { type: "zombie_green", count: 21, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 21, spawnDelay: 0.4 },
      { type: "werewolf", count: 21, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 21, spawnDelay: 0.4 },
    ],
    bonusCoins: 10000,
  },

  // WAVES 26-29: PRE-BOSS GAUNTLET
  {
    waveNumber: 26,
    enemies: [
      { type: "zombie_green", count: 27, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 30, spawnDelay: 0.3 },
      { type: "zombie_red", count: 21, spawnDelay: 0.5 },
      { type: "werewolf", count: 27, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 30, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 21, spawnDelay: 0.5 },
    ],
    bonusCoins: 10400,
  },
  {
    waveNumber: 27,
    enemies: [
      { type: "zombie_green", count: 30, spawnDelay: 0.4 },
      { type: "zombie_blue", count: 27, spawnDelay: 0.3 },
      { type: "zombie_red", count: 24, spawnDelay: 0.5 },
      { type: "werewolf", count: 30, spawnDelay: 0.4 },
      { type: "werewolf_alpha", count: 27, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 24, spawnDelay: 0.5 },
    ],
    bonusCoins: 10800,
  },
  {
    waveNumber: 28,
    enemies: [
      { type: "zombie_giant", count: 3, spawnDelay: 0.5 },
      { type: "werewolf_giant", count: 3, spawnDelay: 0.5 },
      { type: "zombie_green", count: 24, spawnDelay: 0.5 },
      { type: "zombie_blue", count: 30, spawnDelay: 0.3 },
      { type: "zombie_red", count: 21, spawnDelay: 0.5 },
      { type: "werewolf", count: 24, spawnDelay: 0.5 },
      { type: "werewolf_alpha", count: 30, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 21, spawnDelay: 0.5 },
    ],
    bonusCoins: 11200,
  },
  {
    waveNumber: 29,
    enemies: [
      { type: "zombie_green", count: 33, spawnDelay: 0.3 },
      { type: "zombie_blue", count: 33, spawnDelay: 0.3 },
      { type: "zombie_red", count: 27, spawnDelay: 0.5 },
      { type: "werewolf", count: 33, spawnDelay: 0.3 },
      { type: "werewolf_alpha", count: 33, spawnDelay: 0.3 },
      { type: "werewolf_super", count: 27, spawnDelay: 0.5 },
    ],
    bonusCoins: 11600,
  },

  // WAVE 30: DOUBLE BOSS FINALE
  {
    waveNumber: 30,
    enemies: [
      { type: "zombie_boss", count: 1, spawnDelay: 2.0 },
      { type: "werewolf_boss", count: 1, spawnDelay: 2.0 },
      { type: "zombie_green", count: 12, spawnDelay: 0.8 },
      { type: "werewolf", count: 12, spawnDelay: 0.8 },
      { type: "zombie_red", count: 8, spawnDelay: 1.0 },
      { type: "werewolf_super", count: 8, spawnDelay: 1.0 },
    ],
    bonusCoins: 12000,
  },
];

/**
 * Returns the 30-wave config array for a given rebirth phase.
 * Phase 0 = zombies, Phase 1 = werewolves, Phase 2 = enhanced zombies (2x),
 * Phase 3 = all types mixed.
 */
export function getWaveConfigsForPhase(phase: RebirthPhase): WaveConfig[] {
  switch (phase) {
    case 0:
      return WAVE_CONFIGS;
    case 1:
      return PHASE_1_CONFIGS;
    case 2:
      return PHASE_2_CONFIGS;
    case 3:
      return PHASE_3_CONFIGS;
    default:
      return WAVE_CONFIGS;
  }
}
