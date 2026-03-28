import { describe, it, expect } from "vitest";
import {
  computeDirection,
  moveProjectile,
  distance3D,
  hasReachedTarget,
  isExpired,
  findEnemiesInAOE,
  findClosestEnemy,
} from "@game/systems/projectileHelpers";

describe("Projectile System", () => {
  describe("computeDirection", () => {
    it("computes normalized direction vector", () => {
      const dir = computeDirection([0, 0, 0], [3, 0, 4]);
      // Expected: (3/5, 0, 4/5) = (0.6, 0, 0.8)
      expect(dir.x).toBeCloseTo(0.6);
      expect(dir.y).toBeCloseTo(0);
      expect(dir.z).toBeCloseTo(0.8);
    });

    it("returns unit vector (length ~1)", () => {
      const dir = computeDirection([1, 2, 3], [4, 6, 3]);
      const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
      expect(len).toBeCloseTo(1);
    });

    it("handles same start and target (zero vector)", () => {
      const dir = computeDirection([5, 5, 5], [5, 5, 5]);
      expect(dir.x).toBe(0);
      expect(dir.y).toBe(0);
      expect(dir.z).toBe(0);
    });

    it("handles purely vertical direction", () => {
      const dir = computeDirection([0, 0, 0], [0, 10, 0]);
      expect(dir.x).toBeCloseTo(0);
      expect(dir.y).toBeCloseTo(1);
      expect(dir.z).toBeCloseTo(0);
    });
  });

  describe("moveProjectile", () => {
    it("moves in the given direction at speed", () => {
      const pos = { x: 0, y: 1, z: 0 };
      const dir = { x: 1, y: 0, z: 0 };
      const result = moveProjectile(pos, dir, 10, 0.5);
      expect(result.x).toBeCloseTo(5); // 10 * 0.5
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(0);
    });

    it("handles diagonal movement", () => {
      const pos = { x: 0, y: 0, z: 0 };
      const dir = { x: 0.6, y: 0, z: 0.8 };
      const result = moveProjectile(pos, dir, 5, 1);
      expect(result.x).toBeCloseTo(3);
      expect(result.z).toBeCloseTo(4);
    });

    it("small delta = small movement", () => {
      const pos = { x: 0, y: 0, z: 0 };
      const dir = { x: 0, y: 0, z: 1 };
      const result = moveProjectile(pos, dir, 15, 1 / 60);
      expect(result.z).toBeCloseTo(0.25);
    });
  });

  describe("distance3D", () => {
    it("computes correct distance", () => {
      expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBeCloseTo(5);
    });

    it("returns 0 for same point", () => {
      expect(distance3D({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(0);
    });
  });

  describe("hasReachedTarget", () => {
    it("returns true when within threshold", () => {
      expect(hasReachedTarget({ x: 0, y: 0, z: 0 }, { x: 0.3, y: 0, z: 0 })).toBe(true);
    });

    it("returns false when outside threshold", () => {
      expect(hasReachedTarget({ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 })).toBe(false);
    });

    it("respects custom threshold", () => {
      expect(hasReachedTarget({ x: 0, y: 0, z: 0 }, { x: 0.8, y: 0, z: 0 }, 1.0)).toBe(true);
      expect(hasReachedTarget({ x: 0, y: 0, z: 0 }, { x: 0.8, y: 0, z: 0 }, 0.5)).toBe(false);
    });
  });

  describe("isExpired", () => {
    it("returns false for fresh projectile", () => {
      expect(isExpired(1000, 1500)).toBe(false);
    });

    it("returns true after max age", () => {
      expect(isExpired(1000, 4500)).toBe(true);
    });

    it("returns false at exactly max age", () => {
      expect(isExpired(1000, 4000)).toBe(false);
    });

    it("respects custom max age", () => {
      expect(isExpired(1000, 2500, 1000)).toBe(true);
      expect(isExpired(1000, 1500, 1000)).toBe(false);
    });
  });

  describe("findEnemiesInAOE", () => {
    const enemies = [
      { id: "e1", x: 0, z: 0 },
      { id: "e2", x: 2, z: 0 },
      { id: "e3", x: 5, z: 5 },
      { id: "e4", x: 1, z: 1 },
    ];

    it("finds all enemies within radius", () => {
      const hit = findEnemiesInAOE(enemies, 0, 0, 3);
      expect(hit).toContain("e1");
      expect(hit).toContain("e2");
      expect(hit).toContain("e4"); // dist = sqrt(2) ≈ 1.41
      expect(hit).not.toContain("e3");
    });

    it("returns empty for 0 radius", () => {
      const hit = findEnemiesInAOE(enemies, 3, 3, 0);
      expect(hit).toHaveLength(0);
    });

    it("includes enemies exactly at radius boundary", () => {
      // e2 is at distance 2 from origin
      const hit = findEnemiesInAOE(enemies, 0, 0, 2);
      expect(hit).toContain("e2");
    });

    it("returns empty for empty enemy list", () => {
      const hit = findEnemiesInAOE([], 0, 0, 100);
      expect(hit).toHaveLength(0);
    });
  });

  describe("findClosestEnemy", () => {
    const enemies = [
      { id: "e1", x: 3, z: 0 },
      { id: "e2", x: 1, z: 0 },
      { id: "e3", x: 0.5, z: 0 },
    ];

    it("finds the closest enemy", () => {
      expect(findClosestEnemy(enemies, 0, 0)).toBe("e3");
    });

    it("returns null when no enemies within max distance", () => {
      expect(findClosestEnemy(enemies, 100, 100)).toBeNull();
    });

    it("returns null for empty list", () => {
      expect(findClosestEnemy([], 0, 0)).toBeNull();
    });

    it("respects custom max distance", () => {
      expect(findClosestEnemy(enemies, 0, 0, 0.3)).toBeNull();
      expect(findClosestEnemy(enemies, 0, 0, 0.6)).toBe("e3");
    });
  });
});
