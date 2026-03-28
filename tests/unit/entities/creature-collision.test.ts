import { describe, it, expect } from "vitest";
import {
  resolveCreatureCollision,
  CREATURE_COLLISION_RADIUS,
} from "@game/entities/zombieHelpers";

describe("Creature Collision", () => {
  describe("resolveCreatureCollision", () => {
    it("no collision when far apart", () => {
      const result = resolveCreatureCollision(
        { x: 0, z: 0 },
        0.3, // player radius
        [{ x: 10, z: 10 }],
        CREATURE_COLLISION_RADIUS,
      );
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
      expect(result.collided).toBe(false);
    });

    it("pushes entity out when overlapping", () => {
      const result = resolveCreatureCollision(
        { x: 0, z: 0 },
        0.3,
        [{ x: 0.3, z: 0 }], // overlapping
        CREATURE_COLLISION_RADIUS,
      );
      expect(result.collided).toBe(true);
      // Should be pushed away from the creature
      const dist = Math.sqrt(
        (result.x - 0.3) ** 2 + (result.z - 0) ** 2,
      );
      expect(dist).toBeGreaterThanOrEqual(0.3 + CREATURE_COLLISION_RADIUS - 0.01);
    });

    it("handles multiple overlapping creatures", () => {
      const result = resolveCreatureCollision(
        { x: 0, z: 0 },
        0.3,
        [
          { x: 0.3, z: 0 },
          { x: -0.3, z: 0 },
        ],
        CREATURE_COLLISION_RADIUS,
      );
      expect(result.collided).toBe(true);
    });

    it("empty creatures list returns original position", () => {
      const result = resolveCreatureCollision(
        { x: 5, z: 5 },
        0.3,
        [],
        CREATURE_COLLISION_RADIUS,
      );
      expect(result.x).toBe(5);
      expect(result.z).toBe(5);
      expect(result.collided).toBe(false);
    });

    it("CREATURE_COLLISION_RADIUS is reasonable", () => {
      expect(CREATURE_COLLISION_RADIUS).toBeGreaterThan(0);
      expect(CREATURE_COLLISION_RADIUS).toBeLessThan(2);
    });
  });
});
