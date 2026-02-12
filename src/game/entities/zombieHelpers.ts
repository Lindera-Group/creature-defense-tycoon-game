// Pure logic for zombie AI — testable without R3F

export interface Pos2D {
  x: number;
  z: number;
}

export interface MoveResult {
  x: number;
  z: number;
  rotation: number;
}

/**
 * Move zombie toward player. Stops at attack range.
 */
export function moveTowardPlayer(
  zombiePos: Pos2D,
  playerPos: Pos2D,
  speed: number,
  delta: number,
  attackRange = 1.5,
): MoveResult {
  const dx = playerPos.x - zombiePos.x;
  const dz = playerPos.z - zombiePos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  const rotation = Math.atan2(dx, dz);

  if (dist <= attackRange) {
    return { x: zombiePos.x, z: zombiePos.z, rotation };
  }

  const moveAmount = Math.min(speed * delta, dist - attackRange);
  const nx = dx / dist;
  const nz = dz / dist;

  return {
    x: zombiePos.x + nx * moveAmount,
    z: zombiePos.z + nz * moveAmount,
    rotation,
  };
}

/**
 * Check if zombie is within attack range of player.
 */
export function isInAttackRange(
  zombiePos: Pos2D,
  playerPos: Pos2D,
  range: number,
): boolean {
  const dx = playerPos.x - zombiePos.x;
  const dz = playerPos.z - zombiePos.z;
  return dx * dx + dz * dz <= range * range;
}

/**
 * Compute damage and check attack cooldown.
 */
export function computeZombieDamage(
  baseDamage: number,
  attackSpeed: number,
  lastAttackTime: number,
  currentTime: number,
): { damage: number; attacked: boolean } {
  const cooldownMs = 1000 / attackSpeed;
  if (currentTime - lastAttackTime >= cooldownMs) {
    return { damage: baseDamage, attacked: true };
  }
  return { damage: 0, attacked: false };
}
