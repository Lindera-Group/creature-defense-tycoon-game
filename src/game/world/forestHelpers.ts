// Pure logic for forest world generation — testable without R3F

export const FOREST_CONFIG = {
  worldRadius: 80,
  treeCount: 360,
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
  const maxR = FOREST_CONFIG.worldRadius - 3; // margin from world edge
  const minSpacing = 2.0;
  let seed = 0;

  // First pass: uniform distribution in circular area (60%)
  const baseCount = Math.floor(count * 0.6);
  while (positions.length < baseCount && seed < baseCount * 20) {
    // Use polar coordinates for uniform circular distribution
    const angle = seededRandom(seed++) * Math.PI * 2;
    const r = Math.sqrt(seededRandom(seed++)) * maxR; // sqrt for uniform area distribution
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    if (r < clearRadius) continue;

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

  // Second pass: dense outer ring (40%) for thick forest perimeter
  const edgeMin = maxR * 0.6;
  let edgeSeed = seed + 10000;
  const edgeTarget = count - positions.length;
  let edgeCount = 0;

  while (edgeCount < edgeTarget && edgeSeed < seed + 10000 + edgeTarget * 30) {
    const angle = seededRandom(edgeSeed++) * Math.PI * 2;
    const r = edgeMin + seededRandom(edgeSeed++) * (maxR - edgeMin);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

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
    edgeCount++;
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
