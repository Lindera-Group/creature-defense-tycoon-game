export interface Obstacle {
  x: number;
  z: number;
  radius: number; // collision radius
}

/**
 * Check if a projectile's movement this frame hits any obstacle.
 * Uses point-to-segment distance check for each obstacle.
 *
 * @param fromX - projectile start x this frame
 * @param fromZ - projectile start z this frame
 * @param toX - projectile end x this frame
 * @param toZ - projectile end z this frame
 * @param obstacles - list of obstacles with position and radius
 * @returns The first obstacle hit (closest to start), or null
 */
export function checkProjectileObstacleHit(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  obstacles: Obstacle[],
): Obstacle | null {
  let closest: Obstacle | null = null;
  let closestDist = Infinity;

  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const segLenSq = dx * dx + dz * dz;

  const SOURCE_EXCLUSION_RADIUS = 1.5;

  for (const obs of obstacles) {
    // Exclude obstacles near the projectile's start position (don't collide with source)
    const distFromStartX = obs.x - fromX;
    const distFromStartZ = obs.z - fromZ;
    const distFromStartSq = distFromStartX * distFromStartX + distFromStartZ * distFromStartZ;
    if (distFromStartSq <= SOURCE_EXCLUSION_RADIUS * SOURCE_EXCLUSION_RADIUS) {
      continue;
    }

    // Project obstacle onto the movement line segment
    const t = Math.max(
      0,
      Math.min(
        1,
        ((obs.x - fromX) * dx + (obs.z - fromZ) * dz) / (segLenSq || 1),
      ),
    );

    const closestX = fromX + t * dx;
    const closestZ = fromZ + t * dz;

    const distX = obs.x - closestX;
    const distZ = obs.z - closestZ;
    const distSq = distX * distX + distZ * distZ;

    if (distSq < obs.radius * obs.radius) {
      // Hit! Check if it's the closest hit
      const hitDistFromStart = t * Math.sqrt(segLenSq);
      if (hitDistFromStart < closestDist) {
        closestDist = hitDistFromStart;
        closest = obs;
      }
    }
  }

  return closest;
}

/**
 * Build obstacle list from buildings and trees.
 */
export function buildObstacleList(
  buildings: Array<{ position: [number, number, number] }>,
  treePositions: Array<{ x: number; z: number }>,
): Obstacle[] {
  const obstacles: Obstacle[] = [];

  for (const b of buildings) {
    obstacles.push({ x: b.position[0], z: b.position[2], radius: 1.0 });
  }

  for (const t of treePositions) {
    obstacles.push({ x: t.x, z: t.z, radius: 0.8 });
  }

  return obstacles;
}
