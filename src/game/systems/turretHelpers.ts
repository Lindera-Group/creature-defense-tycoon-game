// Pure logic for turret targeting and firing — testable without R3F

import type { TurretConfig, TurretType } from "@shared/types";

export interface TurretTarget {
  id: string;
  x: number;
  z: number;
  health: number;
}

/**
 * Find the closest alive enemy within turret range.
 */
export function findBestTarget(
  turretPos: { x: number; z: number },
  enemies: TurretTarget[],
  range: number,
): TurretTarget | null {
  let best: TurretTarget | null = null;
  let bestDistSq = Infinity;
  const rangeSq = range * range;

  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    const dx = enemy.x - turretPos.x;
    const dz = enemy.z - turretPos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq <= rangeSq && distSq < bestDistSq) {
      best = enemy;
      bestDistSq = distSq;
    }
  }

  return best;
}

/**
 * Check if a turret can fire based on cooldown.
 * attackSpeed is attacks per second, so cooldown = 1000 / attackSpeed ms.
 */
export function canTurretFire(
  lastFireTime: number,
  attackSpeed: number,
  now: number,
): boolean {
  const cooldownMs = 1000 / attackSpeed;
  return now - lastFireTime >= cooldownMs;
}

/**
 * Compute a ProjectileRequest-compatible object for a turret shot.
 */
export function computeTurretProjectile(
  turretPos: [number, number, number],
  targetPos: [number, number, number],
  config: TurretConfig,
): {
  start: [number, number, number];
  target: [number, number, number];
  speed: number;
  damage: number;
  color: string;
} {
  const BARREL_HEIGHT = 1.5;
  return {
    start: [turretPos[0], turretPos[1] + BARREL_HEIGHT, turretPos[2]],
    target: targetPos,
    speed: 20, // All turret projectiles move at 20 u/s
    damage: config.damage,
    color: getTurretProjectileColor(config.type),
  };
}

const TURRET_COLORS: Record<string, string> = {
  basic_turret: "#FFD700", // gold
  laser_turret: "#FF0000", // red laser
  artillery: "#FF6600", // orange explosion
  silver_turret: "#C0C0C0", // silver
  holy_cannon: "#FFFFFF", // white holy
};

/**
 * Get the projectile color for a turret type.
 */
export function getTurretProjectileColor(type: TurretType | string): string {
  return TURRET_COLORS[type] ?? "#FFD700";
}
