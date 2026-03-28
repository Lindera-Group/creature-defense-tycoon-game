import { describe, it, expect } from "vitest";
import { findFortificationInPath } from "@game/systems/fortificationHelpers";
import { FORTIFICATIONS } from "@shared/constants";

interface SimpleFort {
  id: string;
  position: [number, number, number];
  health: number;
}

describe("Fortification Helpers", () => {
  describe("findFortificationInPath", () => {
    const makeFort = (id: string, x: number, z: number, health = 100): SimpleFort => ({
      id,
      position: [x, 0, z],
      health,
    });

    it("should return fortification blocking path", () => {
      const forts = [makeFort("wall1", 5, 0)];
      // Enemy at (10,0) moving toward player at (0,0) — wall at (5,0) is in the way
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        forts,
        1.5,
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe("wall1");
    });

    it("should return null when path is clear", () => {
      const forts = [makeFort("wall1", 20, 20)];
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        forts,
        1.5,
      );
      expect(result).toBeNull();
    });

    it("should return nearest fortification when multiple block path", () => {
      const forts = [
        makeFort("far", 3, 0),
        makeFort("near", 7, 0),
      ];
      // Enemy at (10,0), player at (0,0). Both walls at x=3 and x=7 are in path.
      // "near" (x=7) is closer to the enemy.
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        forts,
        1.5,
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe("near");
    });

    it("should ignore destroyed fortifications (health 0)", () => {
      const forts = [makeFort("dead", 5, 0, 0)];
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        forts,
        1.5,
      );
      expect(result).toBeNull();
    });

    it("should return null with empty fortifications list", () => {
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        [],
        1.5,
      );
      expect(result).toBeNull();
    });

    it("should not block when wall is behind the enemy", () => {
      const forts = [makeFort("behind", 15, 0)];
      // Enemy at (10,0) moving toward player at (0,0) — wall at (15,0) is behind enemy
      const result = findFortificationInPath(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        forts,
        1.5,
      );
      expect(result).toBeNull();
    });
  });

  describe("fortification config validation", () => {
    it("all fortifications should have positive health", () => {
      for (const [, config] of Object.entries(FORTIFICATIONS)) {
        expect(config.health).toBeGreaterThan(0);
      }
    });

    it("all fortifications should have positive cost", () => {
      for (const [, config] of Object.entries(FORTIFICATIONS)) {
        expect(config.cost).toBeGreaterThan(0);
      }
    });

    it("stone wall should have more health than wooden fence", () => {
      expect(FORTIFICATIONS.stone_wall.health).toBeGreaterThan(
        FORTIFICATIONS.wooden_fence.health,
      );
    });

    it("stone wall should cost more than wooden fence", () => {
      expect(FORTIFICATIONS.stone_wall.cost).toBeGreaterThan(
        FORTIFICATIONS.wooden_fence.cost,
      );
    });
  });
});
