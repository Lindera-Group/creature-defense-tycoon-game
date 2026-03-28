import { describe, it, expect } from "vitest";
import {
  FOREST_CONFIG,
  createTreePositions,
  createTreeGeometry,
  resolveTreeCollision,
} from "@game/world/forestHelpers";

describe("Forest World", () => {
  describe("FOREST_CONFIG", () => {
    it("has world radius >= 50", () => {
      expect(FOREST_CONFIG.worldRadius).toBeGreaterThanOrEqual(50);
    });

    it("has enough trees for a dense forest", () => {
      expect(FOREST_CONFIG.treeCount).toBeGreaterThanOrEqual(50);
    });

    it("has a clearing in the center", () => {
      expect(FOREST_CONFIG.clearRadius).toBeGreaterThanOrEqual(10);
    });
  });

  describe("createTreePositions", () => {
    it("generates a large number of tree positions", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      expect(positions.length).toBeGreaterThanOrEqual(100);
    });

    it("trees are not placed within clearRadius of center (spawn area)", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      for (const pos of positions) {
        const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        expect(distFromCenter).toBeGreaterThanOrEqual(FOREST_CONFIG.clearRadius);
      }
    });

    it("trees stay within world radius", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      for (const pos of positions) {
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        expect(dist).toBeLessThanOrEqual(FOREST_CONFIG.worldRadius);
      }
    });

    it("trees maintain minimum spacing", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dz = positions[i].z - positions[j].z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          expect(dist).toBeGreaterThanOrEqual(2.0);
        }
      }
    });

    it("forest has more trees at the perimeter (outer ring)", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      const outerRingMin = 25;
      const innerRingMax = 25;

      const outerTrees = positions.filter(pos => {
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        return dist >= outerRingMin;
      });

      const innerTrees = positions.filter(pos => {
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        return dist < innerRingMax && dist >= FOREST_CONFIG.clearRadius;
      });

      // Outer ring should have more trees than inner ring
      expect(outerTrees.length).toBeGreaterThan(innerTrees.length);
    });
  });

  describe("createTreeGeometry", () => {
    it("returns trunk and canopy data", () => {
      const tree = createTreeGeometry(42);
      expect(tree.trunkHeight).toBeGreaterThan(0);
      expect(tree.trunkRadius).toBeGreaterThan(0);
      expect(tree.canopyRadius).toBeGreaterThan(0);
      expect(tree.canopyType).toMatch(/^(sphere|cone)$/);
    });

    it("produces varying heights from different seeds", () => {
      const tree1 = createTreeGeometry(1);
      const tree2 = createTreeGeometry(2);
      const tree3 = createTreeGeometry(3);
      const heights = new Set([tree1.trunkHeight, tree2.trunkHeight, tree3.trunkHeight]);
      expect(heights.size).toBeGreaterThanOrEqual(2);
    });

    it("trunk height varies within reasonable range", () => {
      for (let seed = 0; seed < 20; seed++) {
        const tree = createTreeGeometry(seed);
        expect(tree.trunkHeight).toBeGreaterThanOrEqual(1);
        expect(tree.trunkHeight).toBeLessThanOrEqual(4);
      }
    });
  });

  describe("resolveTreeCollision", () => {
    it("position in clearing is unchanged", () => {
      const result = resolveTreeCollision(0, 0, 0.3);
      expect(result.collided).toBe(false);
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
    });

    it("position on a tree trunk gets pushed out", () => {
      // Place ourselves exactly on the first tree
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      const tree = positions[0];
      const result = resolveTreeCollision(tree.x, tree.z + 0.1, 0.3);
      expect(result.collided).toBe(true);
      const distAfter = Math.sqrt(
        (result.x - tree.x) ** 2 + (result.z - tree.z) ** 2,
      );
      expect(distAfter).toBeGreaterThanOrEqual(FOREST_CONFIG.treeCollisionRadius + 0.3 - 0.01);
    });
  });
});
