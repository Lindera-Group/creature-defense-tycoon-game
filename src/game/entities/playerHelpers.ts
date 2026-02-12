// Pure logic for player movement — testable without R3F

import { PLAYER_DEFAULTS } from "@shared/constants";

export const PLAYER_BOUNDS = 38; // Ground 80x80 → half=40, minus 2 margin

export interface KeyboardInput {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

export interface Vec2 {
  x: number;
  z: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Compute normalized movement velocity from WASD input.
 * Returns a unit vector (or zero vector if no input).
 */
export function computeMovementVelocity(input: KeyboardInput): Vec2 {
  let x = 0;
  let z = 0;

  if (input.a) x -= 1;
  if (input.d) x += 1;
  if (input.w) z -= 1;
  if (input.s) z += 1;

  const magnitude = Math.sqrt(x * x + z * z);
  if (magnitude === 0) return { x: 0, z: 0 };

  return { x: x / magnitude, z: z / magnitude };
}

/**
 * Clamp position within world bounds.
 */
export function clampPosition(x: number, y: number, z: number): Vec3 {
  return {
    x: Math.max(-PLAYER_BOUNDS, Math.min(PLAYER_BOUNDS, x)),
    y,
    z: Math.max(-PLAYER_BOUNDS, Math.min(PLAYER_BOUNDS, z)),
  };
}

/**
 * Compute Y rotation so the player faces their movement direction.
 * Returns null if there is no movement.
 */
export function computeRotation(velocity: Vec2): number | null {
  if (velocity.x === 0 && velocity.z === 0) return null;
  return Math.atan2(velocity.x, velocity.z);
}

/** Player speed from constants */
export const PLAYER_SPEED = PLAYER_DEFAULTS.speed;
