import { describe, it, expect } from "vitest";
import {
  checkProjectileObstacleHit,
  buildObstacleList,
} from "@game/systems/projectileCollisionHelpers";

describe("Projectile-obstacle collision", () => {
  it("detects hit when projectile passes through obstacle", () => {
    const obstacles = [{ x: 5, z: 0, radius: 1.0 }];
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).not.toBeNull();
    expect(hit!.x).toBe(5);
  });

  it("returns null when projectile misses obstacle", () => {
    const obstacles = [{ x: 5, z: 10, radius: 1.0 }]; // far off path
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).toBeNull();
  });

  it("returns closest obstacle when multiple in path", () => {
    const obstacles = [
      { x: 8, z: 0, radius: 1.0 }, // farther
      { x: 3, z: 0, radius: 1.0 }, // closer
    ];
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).not.toBeNull();
    expect(hit!.x).toBe(3); // should hit the closer one
  });

  it("ignores obstacle behind the projectile", () => {
    const obstacles = [{ x: -5, z: 0, radius: 1.0 }]; // behind start
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).toBeNull();
  });

  it("detects hit for diagonal projectile path", () => {
    const obstacles = [{ x: 5, z: 5, radius: 1.5 }];
    const hit = checkProjectileObstacleHit(0, 0, 10, 10, obstacles);
    expect(hit).not.toBeNull();
  });

  it("respects obstacle radius", () => {
    // Obstacle at (5, 2) with radius 1. Path is along x-axis (z=0).
    // Distance from (5,0) to (5,2) = 2, which is > radius 1
    const obstacles = [{ x: 5, z: 2, radius: 1.0 }];
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).toBeNull();

    // With radius 2.5, should hit
    const obstacles2 = [{ x: 5, z: 2, radius: 2.5 }];
    const hit2 = checkProjectileObstacleHit(0, 0, 10, 0, obstacles2);
    expect(hit2).not.toBeNull();
  });

  it("excludes obstacles at the projectile start position (source exclusion)", () => {
    // Turret at (0, 0) fires projectile from (0, 0) to (10, 0)
    // Obstacle at start position (0, 0) should be ignored
    const obstacles = [{ x: 0, z: 0, radius: 1.0 }];
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).toBeNull();
  });

  it("still collides with obstacles away from source", () => {
    // Turret at (0, 0) fires projectile from (0, 0) to (10, 0)
    // Obstacle at source should be ignored, but obstacle at (5, 0) should hit
    const obstacles = [
      { x: 0, z: 0, radius: 1.0 },  // at source, should be ignored
      { x: 5, z: 0, radius: 1.0 },  // along path, should hit
    ];
    const hit = checkProjectileObstacleHit(0, 0, 10, 0, obstacles);
    expect(hit).not.toBeNull();
    expect(hit!.x).toBe(5); // should hit the second obstacle, not the source
  });

  describe("buildObstacleList", () => {
    it("combines buildings and trees into obstacles", () => {
      const buildings = [{ position: [10, 0, 10] as [number, number, number] }];
      const trees = [{ x: 20, z: 20 }];

      const list = buildObstacleList(buildings, trees);
      expect(list).toHaveLength(2);
      expect(list[0]).toEqual({ x: 10, z: 10, radius: 1.0 });
      expect(list[1]).toEqual({ x: 20, z: 20, radius: 0.8 });
    });

    it("handles empty buildings and trees", () => {
      const list = buildObstacleList([], []);
      expect(list).toHaveLength(0);
    });

    it("handles multiple buildings", () => {
      const buildings = [
        { position: [0, 0, 0] as [number, number, number] },
        { position: [5, 0, 5] as [number, number, number] },
        { position: [10, 0, 10] as [number, number, number] },
      ];
      const list = buildObstacleList(buildings, []);
      expect(list).toHaveLength(3);
      expect(list[0]).toEqual({ x: 0, z: 0, radius: 1.0 });
      expect(list[1]).toEqual({ x: 5, z: 5, radius: 1.0 });
      expect(list[2]).toEqual({ x: 10, z: 10, radius: 1.0 });
    });
  });
});
