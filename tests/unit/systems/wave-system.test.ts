import { describe, it, expect } from "vitest";
import { WAVE_CONFIGS } from "@shared/waveConfigs";

describe("Wave System", () => {
  it("defines waves 1-5", () => {
    expect(WAVE_CONFIGS).toHaveLength(5);
    expect(WAVE_CONFIGS[0].waveNumber).toBe(1);
    expect(WAVE_CONFIGS[4].waveNumber).toBe(5);
  });

  it("wave 1 has 2 green zombies", () => {
    const w1 = WAVE_CONFIGS[0];
    expect(w1.enemies[0].type).toBe("zombie_green");
    expect(w1.enemies[0].count).toBe(2);
  });

  it("enemy counts increase per wave", () => {
    const counts = WAVE_CONFIGS.map((w) =>
      w.enemies.reduce((sum, e) => sum + e.count, 0),
    );
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  it("wave 5 has 8 zombies", () => {
    const w5 = WAVE_CONFIGS[4];
    const total = w5.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(total).toBe(8);
  });

  it("bonus coins increase per wave", () => {
    for (let i = 1; i < WAVE_CONFIGS.length; i++) {
      expect(WAVE_CONFIGS[i].bonusCoins).toBeGreaterThan(
        WAVE_CONFIGS[i - 1].bonusCoins,
      );
    }
  });

  it("spawn delays decrease for later waves", () => {
    const firstDelay = WAVE_CONFIGS[0].enemies[0].spawnDelay;
    const lastDelay = WAVE_CONFIGS[4].enemies[0].spawnDelay;
    expect(lastDelay).toBeLessThan(firstDelay);
  });
});
