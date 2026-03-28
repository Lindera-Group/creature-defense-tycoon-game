// Pure logic for fortification path-blocking — testable without R3F

interface FortificationTarget {
  id: string;
  position: [number, number, number];
  health: number;
}

/**
 * Find the nearest fortification blocking the enemy's path to the target.
 * Uses point-to-line-segment distance to check if a wall is in the way.
 *
 * Returns the nearest blocking fortification (closest to the enemy), or null.
 */
export function findFortificationInPath(
  enemyPos: { x: number; z: number },
  targetPos: { x: number; z: number },
  fortifications: FortificationTarget[],
  hitRadius: number,
): FortificationTarget | null {
  let nearest: FortificationTarget | null = null;
  let nearestDistSq = Infinity;

  for (const fort of fortifications) {
    // Skip destroyed
    if (fort.health <= 0) continue;

    const fx = fort.position[0];
    const fz = fort.position[2];

    // Check if fortification is between enemy and target (not behind the enemy)
    // Project fort position onto the enemy->target vector
    const dx = targetPos.x - enemyPos.x;
    const dz = targetPos.z - enemyPos.z;
    const segLenSq = dx * dx + dz * dz;

    if (segLenSq === 0) continue;

    // t = dot(fort - enemy, target - enemy) / |target - enemy|^2
    const t =
      ((fx - enemyPos.x) * dx + (fz - enemyPos.z) * dz) / segLenSq;

    // Only consider forts between enemy and target (0 <= t <= 1)
    if (t < 0 || t > 1) continue;

    // Closest point on the path segment to the fort
    const closestX = enemyPos.x + t * dx;
    const closestZ = enemyPos.z + t * dz;

    // Distance from fort center to path
    const distX = fx - closestX;
    const distZ = fz - closestZ;
    const distSq = distX * distX + distZ * distZ;

    if (distSq <= hitRadius * hitRadius) {
      // This fort blocks the path — check if it's the nearest to the enemy
      const toEnemyDx = fx - enemyPos.x;
      const toEnemyDz = fz - enemyPos.z;
      const enemyDistSq = toEnemyDx * toEnemyDx + toEnemyDz * toEnemyDz;

      if (enemyDistSq < nearestDistSq) {
        nearest = fort;
        nearestDistSq = enemyDistSq;
      }
    }
  }

  return nearest;
}
