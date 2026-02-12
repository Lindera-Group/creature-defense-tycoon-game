// Pure logic for forest world generation — testable without R3F

export const FOREST_CONFIG = {
  groundWidth: 80,
  groundDepth: 80,
  treeCount: 80,
  clearRadius: 12,
  treeCollisionRadius: 0.8,
  groundColor: "#3a7d2c",
  skyColor: "#87CEEB",
} as const;

export interface TreePosition {
  x: number;
  z: number;
}

export interface TreeGeometry {
  trunkHeight: number;
  trunkRadius: number;
  canopyRadius: number;
  canopyType: "sphere" | "cone";
}

/** Simple seeded pseudo-random: returns value in [0, 1) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * Generate tree positions forming a dense forest with a clearing in the center.
 * Trees are denser toward the edges and absent from the clearing.
 * Minimum spacing between trees prevents overlap.
 */
export function createTreePositions(
  count: number,
  clearRadius: number,
): TreePosition[] {
  const positions: TreePosition[] = [];
  const halfW = FOREST_CONFIG.groundWidth / 2 - 2;
  const halfD = FOREST_CONFIG.groundDepth / 2 - 2;
  const minSpacing = 2.5;
  let seed = 0;

  while (positions.length < count && seed < count * 20) {
    const x = seededRandom(seed++) * halfW * 2 - halfW;
    const z = seededRandom(seed++) * halfD * 2 - halfD;
    const dist = Math.sqrt(x * x + z * z);

    if (dist < clearRadius) continue;

    // Check spacing with existing trees
    let tooClose = false;
    for (const p of positions) {
      const dx = x - p.x;
      const dz = z - p.z;
      if (dx * dx + dz * dz < minSpacing * minSpacing) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    positions.push({ x, z });
  }

  return positions;
}

/**
 * Generate tree geometry data from a seed value.
 * Produces varying heights and canopy types.
 */
export function createTreeGeometry(seed: number): TreeGeometry {
  const r = seededRandom(seed);
  const trunkHeight = 1 + r * 3; // 1 to 4
  const trunkRadius = 0.15 + seededRandom(seed + 100) * 0.15; // 0.15 to 0.3
  const canopyRadius = 0.8 + seededRandom(seed + 200) * 1.2; // 0.8 to 2.0
  const canopyType = seededRandom(seed + 300) > 0.5 ? "cone" : "sphere";

  return { trunkHeight, trunkRadius, canopyRadius, canopyType };
}

// Cached tree positions singleton for collision checks
let _cachedPositions: TreePosition[] | null = null;

export function getTreePositions(): TreePosition[] {
  if (!_cachedPositions) {
    _cachedPositions = createTreePositions(
      FOREST_CONFIG.treeCount,
      FOREST_CONFIG.clearRadius,
    );
  }
  return _cachedPositions;
}

/**
 * Check if a position collides with any tree trunk.
 * Returns the pushed-out position if collision detected, or original position if clear.
 */
export function resolveTreeCollision(
  x: number,
  z: number,
  playerRadius: number,
): { x: number; z: number; collided: boolean } {
  const trees = getTreePositions();
  const colR = FOREST_CONFIG.treeCollisionRadius + playerRadius;

  let outX = x;
  let outZ = z;
  let collided = false;

  for (const tree of trees) {
    const dx = outX - tree.x;
    const dz = outZ - tree.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < colR * colR && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const pushDist = colR - dist;
      const nx = dx / dist;
      const nz = dz / dist;
      outX += nx * pushDist;
      outZ += nz * pushDist;
      collided = true;
    }
  }

  return { x: outX, z: outZ, collided };
}
