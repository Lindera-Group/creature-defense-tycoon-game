import { describe, it, expect } from "vitest";
import {
  findEnemiesInRange,
  isInFrontArc,
} from "@game/systems/combatHelpers";
import { WEAPONS, ENEMIES } from "@shared/constants";

describe("Combat System", () => {
  describe("findEnemiesInRange", () => {
    const enemies = [
      { id: "z1", x: 2, z: 0, health: 30 },
      { id: "z2", x: 10, z: 0, health: 30 },
      { id: "z3", x: 1, z: 1, health: 30 },
      { id: "z4", x: 0, z: 0, health: 0 }, // dead
    ];

    it("finds enemies within weapon range", () => {
      const inRange = findEnemiesInRange(enemies, { x: 0, z: 0 }, 3);
      expect(inRange).toHaveLength(2); // z1 and z3 (z4 is dead)
      expect(inRange.map((e) => e.id)).toContain("z1");
      expect(inRange.map((e) => e.id)).toContain("z3");
    });

    it("excludes dead enemies", () => {
      const inRange = findEnemiesInRange(enemies, { x: 0, z: 0 }, 100);
      const ids = inRange.map((e) => e.id);
      expect(ids).not.toContain("z4");
    });

    it("returns empty when no enemies in range", () => {
      const inRange = findEnemiesInRange(enemies, { x: 0, z: 0 }, 0.5);
      expect(inRange).toHaveLength(0);
    });

    it("returns empty for empty enemy list", () => {
      const inRange = findEnemiesInRange([], { x: 0, z: 0 }, 100);
      expect(inRange).toHaveLength(0);
    });

    it("uses Euclidean distance (diagonal)", () => {
      // Enemy at (3, 4) => distance 5
      const diagonalEnemy = [{ id: "d1", x: 3, z: 4, health: 10 }];
      expect(findEnemiesInRange(diagonalEnemy, { x: 0, z: 0 }, 5)).toHaveLength(1);
      expect(findEnemiesInRange(diagonalEnemy, { x: 0, z: 0 }, 4.9)).toHaveLength(0);
    });
  });

  describe("isInFrontArc", () => {
    it("enemy directly in front is in arc", () => {
      // Player facing -Z (rotation PI), enemy at -Z
      expect(isInFrontArc(
        { x: 0, z: 0 },
        Math.PI,
        { x: 0, z: -3 },
      )).toBe(true);
    });

    it("enemy behind is NOT in arc", () => {
      // Player facing -Z (rotation PI), enemy at +Z (behind)
      expect(isInFrontArc(
        { x: 0, z: 0 },
        Math.PI,
        { x: 0, z: 3 },
      )).toBe(false);
    });

    it("enemy to the side at 89 degrees is in arc (180-degree arc)", () => {
      // Player facing -Z (rotation PI), enemy at -X (90 degrees left)
      expect(isInFrontArc(
        { x: 0, z: 0 },
        Math.PI,
        { x: -3, z: 0 },
      )).toBe(true);
    });

    it("works with player facing +Z (rotation 0)", () => {
      // Facing +Z, enemy ahead at +Z
      expect(isInFrontArc({ x: 0, z: 0 }, 0, { x: 0, z: 5 })).toBe(true);
      // Facing +Z, enemy behind at -Z
      expect(isInFrontArc({ x: 0, z: 0 }, 0, { x: 0, z: -5 })).toBe(false);
    });

    it("works with player facing +X (rotation PI/2)", () => {
      // Facing +X, enemy at +X
      expect(isInFrontArc({ x: 0, z: 0 }, Math.PI / 2, { x: 5, z: 0 })).toBe(true);
      // Facing +X, enemy at -X
      expect(isInFrontArc({ x: 0, z: 0 }, Math.PI / 2, { x: -5, z: 0 })).toBe(false);
    });
  });

  // === Weapon config validation (M2) ===

  describe("Weapon configs", () => {
    it("all ranged weapons have projectileSpeed", () => {
      for (const [name, weapon] of Object.entries(WEAPONS)) {
        if (weapon.isRanged) {
          expect(weapon.projectileSpeed, `${name} missing projectileSpeed`).toBeGreaterThan(0);
        }
      }
    });

    it("melee weapons have no projectileSpeed", () => {
      for (const [name, weapon] of Object.entries(WEAPONS)) {
        if (!weapon.isRanged) {
          expect(weapon.projectileSpeed, `${name} should not have projectileSpeed`).toBeUndefined();
        }
      }
    });

    it("all weapons have positive damage and cost >= 0", () => {
      for (const [name, weapon] of Object.entries(WEAPONS)) {
        expect(weapon.damage, `${name} damage`).toBeGreaterThan(0);
        expect(weapon.cost, `${name} cost`).toBeGreaterThanOrEqual(0);
        expect(weapon.range, `${name} range`).toBeGreaterThan(0);
        expect(weapon.attackSpeed, `${name} attackSpeed`).toBeGreaterThan(0);
      }
    });

    it("ranged weapons have longer range than melee", () => {
      const meleeRanges = Object.values(WEAPONS).filter((w) => !w.isRanged).map((w) => w.range);
      const rangedRanges = Object.values(WEAPONS).filter((w) => w.isRanged).map((w) => w.range);
      const maxMelee = Math.max(...meleeRanges);
      const minRanged = Math.min(...rangedRanges);
      expect(minRanged).toBeGreaterThan(maxMelee);
    });
  });

  // === Enemy config validation (M2) ===

  describe("Enemy configs", () => {
    it("all enemies have valid coinDrop ranges", () => {
      for (const [name, enemy] of Object.entries(ENEMIES)) {
        const [min, max] = enemy.coinDrop;
        expect(min, `${name} coinDrop min`).toBeGreaterThan(0);
        expect(max, `${name} coinDrop max`).toBeGreaterThanOrEqual(min);
      }
    });

    it("boss drops significantly more coins than normal enemies", () => {
      const greenMax = ENEMIES.zombie_green.coinDrop[1];
      const bossMin = ENEMIES.zombie_boss.coinDrop[0];
      expect(bossMin).toBeGreaterThan(greenMax * 10);
    });

    it("boss has highest health of all Phase 0 zombies", () => {
      const phase0Zombies = ["zombie_green", "zombie_blue", "zombie_red", "zombie_giant", "zombie_boss"];
      const bossHealth = ENEMIES.zombie_boss.health;
      for (const name of phase0Zombies) {
        if (name !== "zombie_boss") {
          expect(bossHealth, `boss should have more health than ${name}`).toBeGreaterThan(ENEMIES[name].health);
        }
      }
    });

    it("giant is bigger than normal zombies", () => {
      expect(ENEMIES.zombie_giant.scale).toBeGreaterThan(ENEMIES.zombie_green.scale);
      expect(ENEMIES.zombie_giant.scale).toBeGreaterThan(ENEMIES.zombie_blue.scale);
      expect(ENEMIES.zombie_giant.scale).toBeGreaterThan(ENEMIES.zombie_red.scale);
    });

    it("boss scale makes it ~12m tall (scale 8)", () => {
      expect(ENEMIES.zombie_boss.scale).toBeGreaterThanOrEqual(8);
    });
  });
});
