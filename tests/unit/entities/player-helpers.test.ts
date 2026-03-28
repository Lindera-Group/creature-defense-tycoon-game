import { describe, it, expect } from "vitest";
import { resolveBuildingCollision, BUILDING_COLLISION_RADIUS, type BuildingPosition } from "@game/entities/playerHelpers";

describe("resolveBuildingCollision", () => {
  const playerRadius = 0.3;

  it("player not colliding when far from building returns original position", () => {
    const buildings: BuildingPosition[] = [
      { position: [10, 0, 10] },
    ];

    const result = resolveBuildingCollision(0, 0, playerRadius, buildings);

    expect(result.x).toBe(0);
    expect(result.z).toBe(0);
    expect(result.collided).toBe(false);
  });

  it("player colliding when overlapping building is pushed out to correct distance", () => {
    const buildings: BuildingPosition[] = [
      { position: [0, 0, 0] },
    ];

    const result = resolveBuildingCollision(0.5, 0, playerRadius, buildings);

    // Expected collision radius = 0.8 (building) + 0.3 (player) = 1.1
    // Player at 0.5 from building center is inside collision radius
    // Should be pushed out to distance >= 1.1
    const distFromBuilding = Math.sqrt(result.x * result.x + result.z * result.z);
    expect(distFromBuilding).toBeGreaterThanOrEqual(BUILDING_COLLISION_RADIUS + playerRadius - 0.01);
    expect(result.collided).toBe(true);
  });

  it("multiple buildings resolves all collisions", () => {
    const buildings: BuildingPosition[] = [
      { position: [0, 0, 0] },
      { position: [2, 0, 0] },
    ];

    const result = resolveBuildingCollision(1, 0, playerRadius, buildings);

    // Player at (1, 0) is between two buildings at (0, 0) and (2, 0)
    // Sequential resolution means player will be pushed toward one side
    // At least one collision should be resolved
    const distFromFirst = Math.sqrt(result.x * result.x + result.z * result.z);
    const distFromSecond = Math.sqrt((result.x - 2) ** 2 + result.z ** 2);
    const minDist = BUILDING_COLLISION_RADIUS + playerRadius;

    // At least one building should be resolved (player can't be equidistant from both)
    const firstResolved = distFromFirst >= minDist - 0.01;
    const secondResolved = distFromSecond >= minDist - 0.01;
    expect(firstResolved || secondResolved).toBe(true);
    expect(result.collided).toBe(true);
  });

  it("building at player's exact position (edge case) is handled without crash", () => {
    const buildings: BuildingPosition[] = [
      { position: [0, 0, 0] },
    ];

    // Player exactly at building center
    const result = resolveBuildingCollision(0, 0, playerRadius, buildings);

    // Should handle div by zero gracefully (distSq > 0 check prevents this)
    expect(result.x).toBe(0);
    expect(result.z).toBe(0);
    expect(result.collided).toBe(false);
  });

  it("no buildings returns original position", () => {
    const buildings: BuildingPosition[] = [];

    const result = resolveBuildingCollision(5, 7, playerRadius, buildings);

    expect(result.x).toBe(5);
    expect(result.z).toBe(7);
    expect(result.collided).toBe(false);
  });

  it("BUILDING_COLLISION_RADIUS matches expected value", () => {
    // Should match the building footprint size
    expect(BUILDING_COLLISION_RADIUS).toBe(0.8);
  });
});
