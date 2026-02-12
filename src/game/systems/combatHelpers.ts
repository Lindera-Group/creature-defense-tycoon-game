// Pure logic for combat system — testable without R3F

export interface EnemyTarget {
  id: string;
  x: number;
  z: number;
  health: number;
}

export interface Pos2D {
  x: number;
  z: number;
}

/**
 * Find alive enemies within weapon range.
 */
export function findEnemiesInRange(
  enemies: EnemyTarget[],
  playerPos: Pos2D,
  range: number,
): EnemyTarget[] {
  return enemies.filter((e) => {
    if (e.health <= 0) return false;
    const dx = e.x - playerPos.x;
    const dz = e.z - playerPos.z;
    return dx * dx + dz * dz <= range * range;
  });
}

/**
 * Check if enemy is within player's 180-degree front arc.
 * playerRotation is Y rotation (atan2-based, facing direction).
 */
export function isInFrontArc(
  playerPos: Pos2D,
  playerRotation: number,
  enemyPos: Pos2D,
): boolean {
  const dx = enemyPos.x - playerPos.x;
  const dz = enemyPos.z - playerPos.z;

  // Player facing direction from rotation
  const facingX = Math.sin(playerRotation);
  const facingZ = Math.cos(playerRotation);

  // Dot product: non-negative = in front (180-degree arc includes sides)
  const dot = dx * facingX + dz * facingZ;
  return dot >= -0.001;
}
