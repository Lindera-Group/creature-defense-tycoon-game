import type { WaveConfig } from "./types";

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    waveNumber: 1,
    enemies: [{ type: "zombie_green", count: 2, spawnDelay: 3.0 }],
    bonusCoins: 50,
  },
  {
    waveNumber: 2,
    enemies: [{ type: "zombie_green", count: 3, spawnDelay: 2.5 }],
    bonusCoins: 100,
  },
  {
    waveNumber: 3,
    enemies: [{ type: "zombie_green", count: 4, spawnDelay: 2.0 }],
    bonusCoins: 150,
  },
  {
    waveNumber: 4,
    enemies: [{ type: "zombie_green", count: 5, spawnDelay: 2.0 }],
    bonusCoins: 200,
  },
  {
    waveNumber: 5,
    enemies: [{ type: "zombie_green", count: 8, spawnDelay: 1.5 }],
    bonusCoins: 300,
  },
];
