import { describe, it, expect } from "vitest";
import { getTreeSpawnPosition } from "@game/systems/spawnHelpers";

describe("Tree-based zombie spawning", () => {
  // Trees at various distances for testing distance bias
  const mockTrees = [
    { x: 15, z: 0 },   // close (dist 15)
    { x: -18, z: 22 },  // mid (dist ~28.4)
    { x: 50, z: -40 },  // far (dist ~64)
  ];

  it("should spawn near a tree with 1-3 unit offset", () => {
    for (let i = 0; i < 50; i++) {
      const pos = getTreeSpawnPosition(mockTrees, 12);

      // Find closest tree
      let minDist = Infinity;
      for (const tree of mockTrees) {
        const dx = pos[0] - tree.x;
        const dz = pos[2] - tree.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist) minDist = dist;
      }

      expect(minDist).toBeGreaterThanOrEqual(1);
      expect(minDist).toBeLessThanOrEqual(3);
      expect(pos[1]).toBe(0);
    }
  });

  it("should fall back to ring spawn when no trees", () => {
    const mockRandom = () => 0;
    const pos = getTreeSpawnPosition([], 12, mockRandom);
    expect(pos[0]).toBeCloseTo(17, 0);
    expect(pos[1]).toBe(0);
    expect(pos[2]).toBeCloseTo(0, 0);
  });

  it("should bias spawns toward closer trees", () => {
    let closeCount = 0;
    let farCount = 0;

    for (let i = 0; i < 300; i++) {
      const pos = getTreeSpawnPosition(mockTrees, 12);
      const dist = Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]);
      if (dist < 30) closeCount++;
      else farCount++;
    }

    // Close spawns should significantly outnumber far spawns (60% bias)
    expect(closeCount).toBeGreaterThan(farCount);
  });

  it("should produce varied spawn distances", () => {
    const distances: number[] = [];
    for (let i = 0; i < 100; i++) {
      const pos = getTreeSpawnPosition(mockTrees, 12);
      distances.push(Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]));
    }

    const minDist = Math.min(...distances);
    const maxDist = Math.max(...distances);
    expect(maxDist - minDist).toBeGreaterThan(10);
  });

  it("should use multiple different trees", () => {
    const positions = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const pos = getTreeSpawnPosition(mockTrees, 12);
      positions.add(`${Math.round(pos[0])},${Math.round(pos[2])}`);
    }
    expect(positions.size).toBeGreaterThan(3);
  });

  it("all trees can be selected (including far ones)", () => {
    const closestTreeIndices = new Set<number>();

    for (let i = 0; i < 500; i++) {
      const pos = getTreeSpawnPosition(mockTrees, 12);
      let closestIdx = 0;
      let minDist = Infinity;
      mockTrees.forEach((tree, idx) => {
        const dx = pos[0] - tree.x;
        const dz = pos[2] - tree.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });
      closestTreeIndices.add(closestIdx);
    }

    // All trees should be used at least once
    expect(closestTreeIndices.size).toBe(mockTrees.length);
  });
});
