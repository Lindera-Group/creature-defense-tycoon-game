import { describe, it, expect } from "vitest";
import {
  isValidPlacement,
  snapToGrid,
  BUILDING_COLLISION_RADIUS,
  TREE_COLLISION_RADIUS,
  DEFAULT_GRID_SIZE,
} from "@game/systems/placementHelpers";

describe("Placement system v2 (tighter grid)", () => {
  it("BUILDING_COLLISION_RADIUS is 1.5 (was 2.5)", () => {
    expect(BUILDING_COLLISION_RADIUS).toBe(1.5);
  });

  it("TREE_COLLISION_RADIUS is 1.2 (was 2.0)", () => {
    expect(TREE_COLLISION_RADIUS).toBe(1.2);
  });

  it("DEFAULT_GRID_SIZE is 2", () => {
    expect(DEFAULT_GRID_SIZE).toBe(2);
  });

  it("allows buildings at 2-unit grid spacing", () => {
    const buildings = [{ position: [10, 0, 10] as [number, number, number] }];
    // 2 units away on grid should be valid (dist=2 > 1.5)
    expect(isValidPlacement(12, 10, buildings, [])).toBe(true);
    expect(isValidPlacement(10, 12, buildings, [])).toBe(true);
  });

  it("prevents overlapping buildings (within 1.5)", () => {
    const buildings = [{ position: [10, 0, 10] as [number, number, number] }];
    // 1 unit away should be invalid (dist=1 < 1.5)
    expect(isValidPlacement(11, 10, buildings, [])).toBe(false);
    expect(isValidPlacement(10, 11, buildings, [])).toBe(false);
  });

  it("allows building near tree at safe distance", () => {
    const trees: [number, number][] = [[15, 15]];
    // 2 units from tree should be valid (dist=2 > 1.2)
    expect(isValidPlacement(17, 15, [], trees)).toBe(true);
    expect(isValidPlacement(15, 17, [], trees)).toBe(true);
  });

  it("prevents building too close to tree", () => {
    const trees: [number, number][] = [[15, 15]];
    // 1 unit from tree should be invalid (dist=1 < 1.2)
    expect(isValidPlacement(16, 15, [], trees)).toBe(false);
    expect(isValidPlacement(15, 16, [], trees)).toBe(false);
  });

  it("snapToGrid snaps to 2-unit grid by default", () => {
    expect(snapToGrid(10.3, 10.7)).toEqual([10, 10]);
    expect(snapToGrid(11.1, 11.9)).toEqual([12, 12]);
    expect(snapToGrid(-3.7, -1.2)).toEqual([-4, -2]);
  });

  it("allows diagonal placement on grid", () => {
    const buildings = [{ position: [10, 0, 10] as [number, number, number] }];
    // Diagonal 2 units away: sqrt(2^2 + 2^2) = 2.83 > 1.5
    expect(isValidPlacement(12, 12, buildings, [])).toBe(true);
  });
});
