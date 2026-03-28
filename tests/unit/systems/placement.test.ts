import { describe, it, expect } from "vitest";
import {
  isValidPlacement,
  snapToGrid,
} from "@game/systems/placementHelpers";

describe("Placement Helpers", () => {
  const emptyBuildings: Array<{ position: [number, number, number] }> = [];
  const emptyTrees: Array<[number, number]> = [];

  describe("isValidPlacement", () => {
    it("should return true for a valid open position", () => {
      expect(isValidPlacement(15, 15, emptyBuildings, emptyTrees)).toBe(true);
    });

    it("should return false when overlapping a tree", () => {
      const trees: Array<[number, number]> = [[10, 10]];
      expect(isValidPlacement(10.5, 10.5, emptyBuildings, trees)).toBe(false);
    });

    it("should return true when far enough from a tree", () => {
      const trees: Array<[number, number]> = [[10, 10]];
      // Distance needs to be > TREE_COLLISION_RADIUS (1.2)
      expect(isValidPlacement(12, 12, emptyBuildings, trees)).toBe(true);
    });

    it("should return false when overlapping another building", () => {
      const buildings: Array<{ position: [number, number, number] }> = [
        { position: [10, 0, 10] },
      ];
      expect(isValidPlacement(11, 11, buildings, emptyTrees)).toBe(false);
    });

    it("should return true when far enough from another building", () => {
      const buildings: Array<{ position: [number, number, number] }> = [
        { position: [10, 0, 10] },
      ];
      // Distance needs to be > BUILDING_COLLISION_RADIUS (1.5)
      expect(isValidPlacement(12, 12, buildings, emptyTrees)).toBe(true);
    });

    it("should return false when outside circular world bounds", () => {
      // WORLD_BOUNDS = 75, so distance > 75 is out of bounds
      expect(isValidPlacement(76, 0, emptyBuildings, emptyTrees)).toBe(false);
      expect(isValidPlacement(54, 54, emptyBuildings, emptyTrees)).toBe(false); // ~76.4
    });

    it("should return false when too close to origin (spawn area)", () => {
      expect(isValidPlacement(0, 0, emptyBuildings, emptyTrees)).toBe(false);
      expect(isValidPlacement(2, 0, emptyBuildings, emptyTrees)).toBe(false);
      expect(isValidPlacement(2, 2, emptyBuildings, emptyTrees)).toBe(false);
    });

    it("should return true at valid distance from origin", () => {
      expect(isValidPlacement(8, 8, emptyBuildings, emptyTrees)).toBe(true);
    });
  });

  describe("snapToGrid", () => {
    it("should snap to nearest 2-unit grid", () => {
      expect(snapToGrid(5.3, 7.8)).toEqual([6, 8]);
    });

    it("should snap negative coordinates", () => {
      expect(snapToGrid(-3.7, -1.2)).toEqual([-4, -2]);
    });

    it("should keep values already on grid", () => {
      expect(snapToGrid(10, 12)).toEqual([10, 12]);
    });

    it("should snap with custom grid size", () => {
      expect(snapToGrid(5.3, 7.8, 4)).toEqual([4, 8]);
    });
  });
});
