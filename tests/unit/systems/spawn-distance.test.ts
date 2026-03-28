import { describe, it, expect } from "vitest";
import { getTreeSpawnPosition } from "@game/systems/spawnHelpers";
import { FOREST_CONFIG } from "@game/world/forestHelpers";
import type { TreePosition } from "@game/world/forestHelpers";

describe("Spawn Distance Variation", () => {
  // Create mock trees at various distances
  const trees: TreePosition[] = [];
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    // Trees at distances 15, 25, 35, 50, 70
    const distances = [15, 25, 35, 50, 70];
    const dist = distances[i % distances.length];
    trees.push({ x: Math.cos(angle) * dist, z: Math.sin(angle) * dist });
  }

  it("spawns produce varied distances from origin", () => {
    const distances: number[] = [];
    let seed = 0;
    const rng = () => {
      seed++;
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 50; i++) {
      const [x, , z] = getTreeSpawnPosition(trees, FOREST_CONFIG.clearRadius, rng);
      distances.push(Math.sqrt(x * x + z * z));
    }

    const minDist = Math.min(...distances);
    const maxDist = Math.max(...distances);

    // Spawns should happen at varied distances, not all at the edge
    expect(maxDist - minDist).toBeGreaterThan(15);
  });

  it("some spawns are close to the clearing (within 30 units)", () => {
    const closeSrc: number[] = [];
    let seed = 100;
    const rng = () => {
      seed++;
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 100; i++) {
      const [x, , z] = getTreeSpawnPosition(trees, FOREST_CONFIG.clearRadius, rng);
      const dist = Math.sqrt(x * x + z * z);
      if (dist < 30) closeSrc.push(dist);
    }

    // At least some spawns should be close (within 30 units)
    expect(closeSrc.length).toBeGreaterThan(0);
  });

  it("spawns are outside the clear radius", () => {
    let seed = 200;
    const rng = () => {
      seed++;
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 50; i++) {
      const [x, , z] = getTreeSpawnPosition(trees, FOREST_CONFIG.clearRadius, rng);
      const dist = Math.sqrt(x * x + z * z);
      // Should not spawn inside the clearing (minus some offset tolerance)
      expect(dist).toBeGreaterThan(FOREST_CONFIG.clearRadius - 3);
    }
  });
});
