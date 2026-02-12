import { describe, it, expect } from "vitest";
import {
  findEnemiesInRange,
  isInFrontArc,
} from "@game/systems/combatHelpers";

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
  });
});
