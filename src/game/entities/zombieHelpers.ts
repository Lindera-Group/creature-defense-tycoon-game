// Pure logic for zombie AI — testable without R3F

export interface Pos2D {
  x: number;
  z: number;
}

export interface TargetableEntity {
  type: "player" | "turret" | "fortification";
  id: string;
  x: number;
  z: number;
}

/**
 * Find the nearest targetable entity to the zombie.
 * Returns the closest one by Euclidean distance.
 */
export function findNearestTarget(
  zombiePos: Pos2D,
  targets: TargetableEntity[],
): TargetableEntity | null {
  let nearest: TargetableEntity | null = null;
  let nearestDistSq = Infinity;

  for (const target of targets) {
    const dx = target.x - zombiePos.x;
    const dz = target.z - zombiePos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = target;
    }
  }

  return nearest;
}

export const CREATURE_COLLISION_RADIUS = 0.5;

/**
 * Push an entity out of any overlapping creatures.
 * Works for player-vs-zombie and zombie-vs-zombie collision.
 */
export function resolveCreatureCollision(
  entityPos: Pos2D,
  entityRadius: number,
  creatures: Pos2D[],
  creatureRadius: number,
): { x: number; z: number; collided: boolean } {
  let outX = entityPos.x;
  let outZ = entityPos.z;
  let collided = false;

  for (const creature of creatures) {
    const colR = entityRadius + creatureRadius;
    const dx = outX - creature.x;
    const dz = outZ - creature.z;
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
