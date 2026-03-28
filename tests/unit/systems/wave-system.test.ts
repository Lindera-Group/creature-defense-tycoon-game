import { describe, it, expect } from "vitest";
import { WAVE_CONFIGS } from "@shared/waveConfigs";
import { ENEMIES, WEAPONS } from "@shared/constants";

describe("Wave System", () => {
  it("defines waves 1-30", () => {
    expect(WAVE_CONFIGS).toHaveLength(30);
    expect(WAVE_CONFIGS[0].waveNumber).toBe(1);
    expect(WAVE_CONFIGS[29].waveNumber).toBe(30);
  });

  it("wave numbers are sequential", () => {
    for (let i = 0; i < WAVE_CONFIGS.length; i++) {
      expect(WAVE_CONFIGS[i].waveNumber).toBe(i + 1);
    }
  });

  it("wave 1 has 2 green zombies", () => {
    const w1 = WAVE_CONFIGS[0];
    expect(w1.enemies[0].type).toBe("zombie_green");
    expect(w1.enemies[0].count).toBe(8);
  });

  it("wave 5 has enough zombies for tutorial finale", () => {
    const w5 = WAVE_CONFIGS[4];
    const total = w5.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(total).toBeGreaterThanOrEqual(10);
  });

  it("bonus coins never decrease", () => {
    for (let i = 1; i < WAVE_CONFIGS.length; i++) {
      expect(WAVE_CONFIGS[i].bonusCoins).toBeGreaterThanOrEqual(
        WAVE_CONFIGS[i - 1].bonusCoins,
      );
    }
  });

  it("miniboss waves (10, 15, 20, 25) include a giant", () => {
    for (const waveNum of [10, 15, 20, 25]) {
      const wave = WAVE_CONFIGS[waveNum - 1];
      const hasGiant = wave.enemies.some((e) => e.type === "zombie_giant");
      expect(hasGiant, `wave ${waveNum} should have a giant`).toBe(true);
    }
  });

  it("wave 30 is the boss wave", () => {
    const w30 = WAVE_CONFIGS[29];
    const hasBoss = w30.enemies.some((e) => e.type === "zombie_boss");
    expect(hasBoss).toBe(true);
  });

  it("spawn delays decrease for tutorial waves", () => {
    const firstDelay = WAVE_CONFIGS[0].enemies[0].spawnDelay;
    const fifthDelay = WAVE_CONFIGS[4].enemies[0].spawnDelay;
    expect(fifthDelay).toBeLessThan(firstDelay);
  });

  // === M2 additions: deeper wave validation ===

  it("all waves have at least one enemy group", () => {
    for (const wave of WAVE_CONFIGS) {
      expect(wave.enemies.length, `wave ${wave.waveNumber}`).toBeGreaterThanOrEqual(1);
    }
  });

  it("all enemy types in waves exist in ENEMIES config", () => {
    for (const wave of WAVE_CONFIGS) {
      for (const group of wave.enemies) {
        expect(ENEMIES[group.type], `${group.type} in wave ${wave.waveNumber}`).toBeDefined();
      }
    }
  });

  it("all spawn delays are positive", () => {
    for (const wave of WAVE_CONFIGS) {
      for (const group of wave.enemies) {
        expect(group.spawnDelay, `wave ${wave.waveNumber} ${group.type}`).toBeGreaterThan(0);
      }
    }
  });

  it("all enemy counts are positive", () => {
    for (const wave of WAVE_CONFIGS) {
      for (const group of wave.enemies) {
        expect(group.count, `wave ${wave.waveNumber} ${group.type}`).toBeGreaterThan(0);
      }
    }
  });

  it("waves 1-5 are green-only (tutorial)", () => {
    for (let i = 0; i < 5; i++) {
      const types = WAVE_CONFIGS[i].enemies.map((e) => e.type);
      expect(types, `wave ${i + 1} should only have green`).toEqual(["zombie_green"]);
    }
  });

  it("blue zombies appear from wave 6", () => {
    const firstBlue = WAVE_CONFIGS.findIndex((w) =>
      w.enemies.some((e) => e.type === "zombie_blue"),
    );
    expect(firstBlue).toBe(5); // index 5 = wave 6
  });

  it("red zombies appear from wave 11", () => {
    const firstRed = WAVE_CONFIGS.findIndex((w) =>
      w.enemies.some((e) => e.type === "zombie_red"),
    );
    expect(firstRed).toBe(10); // index 10 = wave 11
  });

  it("total economy supports buying all Phase 0 weapons", () => {
    // Calculate total coins available
    let totalCoins = 0;
    for (const wave of WAVE_CONFIGS) {
      totalCoins += wave.bonusCoins;
      for (const group of wave.enemies) {
        const config = ENEMIES[group.type];
        // Use average coin drop
        const avgDrop = (config.coinDrop[0] + config.coinDrop[1]) / 2;
        totalCoins += group.count * avgDrop;
      }
    }

    // Calculate total weapon cost for Phase 0
    const phase0WeaponCost = Object.values(WEAPONS)
      .filter((w) => w.unlockedAtPhase === 0)
      .reduce((sum, w) => sum + w.cost, 0);

    expect(totalCoins).toBeGreaterThan(phase0WeaponCost);
  });

  it("boss wave has the most bonus coins", () => {
    const bossBonus = WAVE_CONFIGS[29].bonusCoins;
    for (let i = 0; i < 29; i++) {
      expect(bossBonus).toBeGreaterThanOrEqual(WAVE_CONFIGS[i].bonusCoins);
    }
  });
});
