import type { TreePosition } from "@game/world/forestHelpers";

/**
 * Pick a random tree position to spawn an enemy near.
 * Biased toward closer trees (50% chance to pick from nearest half).
 * Adds a small random offset (1-3 units) so enemies don't spawn ON the tree.
 * Falls back to ring spawn if no trees available.
 */
export function getTreeSpawnPosition(
  treePositions: TreePosition[],
  clearRadius: number,
  random: () => number = Math.random,
): [number, number, number] {
  if (treePositions.length === 0) {
    // Fallback: ring spawn
    const angle = random() * Math.PI * 2;
    const dist = clearRadius + 5;
    return [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
  }

  // Sort by distance from origin (cached on first call per set)
  const sorted = [...treePositions].sort((a, b) => {
    const da = a.x * a.x + a.z * a.z;
    const db = b.x * b.x + b.z * b.z;
    return da - db;
  });

  // 60% chance to pick from closest third, 30% middle third, 10% far third
  const roll = random();
  const third = Math.floor(sorted.length / 3);
  let pool: TreePosition[];
  if (roll < 0.6) {
    pool = sorted.slice(0, third); // closest third
  } else if (roll < 0.9) {
    pool = sorted.slice(third, third * 2); // middle third
  } else {
    pool = sorted.slice(third * 2); // far third
  }

  const tree = pool[Math.floor(random() * pool.length)];

  // Add offset (1-3 units in random direction)
  const angle = random() * Math.PI * 2;
  const offset = 1 + random() * 2;

  return [
    tree.x + Math.cos(angle) * offset,
    0,
    tree.z + Math.sin(angle) * offset,
  ];
}
