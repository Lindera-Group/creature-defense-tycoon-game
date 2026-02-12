import { describe, it, expect } from "vitest";
import {
  FOREST_CONFIG,
  createTreePositions,
  createTreeGeometry,
  resolveTreeCollision,
} from "@game/world/forestHelpers";

describe("Forest World", () => {
  describe("FOREST_CONFIG", () => {
    it("has ground dimensions >= 50x50", () => {
      expect(FOREST_CONFIG.groundWidth).toBeGreaterThanOrEqual(50);
      expect(FOREST_CONFIG.groundDepth).toBeGreaterThanOrEqual(50);
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
      expect(positions.length).toBeGreaterThanOrEqual(50);
    });

    it("trees are not placed within clearRadius of center (spawn area)", () => {
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      for (const pos of positions) {
        const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        expect(distFromCenter).toBeGreaterThanOrEqual(FOREST_CONFIG.clearRadius);
      }
    });

    it("trees stay within world bounds", () => {
      const halfW = FOREST_CONFIG.groundWidth / 2;
      const halfD = FOREST_CONFIG.groundDepth / 2;
      const positions = createTreePositions(FOREST_CONFIG.treeCount, FOREST_CONFIG.clearRadius);
      for (const pos of positions) {
        expect(Math.abs(pos.x)).toBeLessThanOrEqual(halfW);
        expect(Math.abs(pos.z)).toBeLessThanOrEqual(halfD);
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
