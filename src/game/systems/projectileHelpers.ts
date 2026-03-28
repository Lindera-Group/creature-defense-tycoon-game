// Pure logic for projectile system — testable without R3F

export interface Pos3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectileState {
  position: Pos3D;
  directionX: number;
  directionY: number;
  directionZ: number;
  speed: number;
  target: Pos3D;
  createdAt: number;
}

export interface EnemyPos {
  id: string;
  x: number;
  z: number;
}

/**
 * Compute normalized direction from start to target.
 */
export function computeDirection(
  start: [number, number, number],
  target: [number, number, number],
): { x: number; y: number; z: number } {
  const dx = target[0] - start[0];
  const dy = target[1] - start[1];
  const dz = target[2] - start[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: dx / len, y: dy / len, z: dz / len };
}

/**
 * Move projectile forward by delta time. Returns new position.
 */
export function moveProjectile(
  pos: Pos3D,
  direction: Pos3D,
  speed: number,
  delta: number,
): Pos3D {
  return {
    x: pos.x + direction.x * speed * delta,
    y: pos.y + direction.y * speed * delta,
    z: pos.z + direction.z * speed * delta,
  };
}

/**
 * Check distance between two 3D points.
 */
export function distance3D(a: Pos3D, b: Pos3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if projectile has reached its target (within threshold).
 */
export function hasReachedTarget(pos: Pos3D, target: Pos3D, threshold: number = 0.5): boolean {
  return distance3D(pos, target) < threshold;
}

/**
 * Check if a projectile is expired (too old).
 */
export function isExpired(createdAt: number, now: number, maxAge: number = 3000): boolean {
  return now - createdAt > maxAge;
}

/**
 * Find enemies within AOE radius of an impact point (2D distance on XZ plane).
 */
export function findEnemiesInAOE(
  enemies: EnemyPos[],
  impactX: number,
  impactZ: number,
  radius: number,
): string[] {
  return enemies
    .filter((e) => {
      const dx = e.x - impactX;
      const dz = e.z - impactZ;
      return Math.sqrt(dx * dx + dz * dz) <= radius;
    })
    .map((e) => e.id);
}

/**
 * Find the closest enemy to an impact point (2D on XZ plane).
 * Returns null if no enemies within maxDistance.
 */
export function findClosestEnemy(
  enemies: EnemyPos[],
  impactX: number,
  impactZ: number,
  maxDistance: number = 2,
): string | null {
  let closestId: string | null = null;
  let closestDist = Infinity;

  for (const enemy of enemies) {
    const dx = enemy.x - impactX;
    const dz = enemy.z - impactZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < closestDist && dist < maxDistance) {
      closestDist = dist;
      closestId = enemy.id;
    }
  }

  return closestId;
}
