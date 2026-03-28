// Pure logic for player movement — testable without R3F

import { PLAYER_DEFAULTS } from "@shared/constants";

export const WORLD_RADIUS = 80; // Circular world radius
export const PLAYER_BOUNDS = WORLD_RADIUS - 2; // Margin from edge

export interface KeyboardInput {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  shift: boolean;
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
 * Pass position through (no clamping — player can walk off the edge and die).
 */
export function clampPosition(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

/**
 * Check if position is past the world edge (death zone).
 */
export function isPastWorldEdge(x: number, z: number): boolean {
  return Math.sqrt(x * x + z * z) >= WORLD_RADIUS;
}

/**
 * Rotate a movement vector by the camera azimuth so that
 * "forward" (W) always moves in the camera's forward direction.
 */
export function rotateMovementByCamera(velocity: Vec2, cameraAzimuth: number): Vec2 {
  if (velocity.x === 0 && velocity.z === 0) return velocity;
  const cos = Math.cos(cameraAzimuth);
  const sin = Math.sin(cameraAzimuth);
  return {
    x: velocity.x * cos + velocity.z * sin,
    z: -velocity.x * sin + velocity.z * cos,
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
export const SPRINT_MULTIPLIER = 1.8;

export interface BuildingPosition {
  position: [number, number, number];
}

export const BUILDING_COLLISION_RADIUS = 0.8;

/**
 * Push player out of any overlapping buildings.
 * Same push-out algorithm as resolveTreeCollision in forestHelpers.ts.
 */
export function resolveBuildingCollision(
  x: number,
  z: number,
  playerRadius: number,
  buildings: BuildingPosition[],
): { x: number; z: number; collided: boolean } {
  let outX = x;
  let outZ = z;
  let collided = false;

  for (const building of buildings) {
    const bx = building.position[0];
    const bz = building.position[2];
    const colR = BUILDING_COLLISION_RADIUS + playerRadius;
    const dx = outX - bx;
    const dz = outZ - bz;
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
