/**
 * Camera control helpers for zoom and orbit functionality.
 * All functions are pure for testability.
 */

/**
 * Compute camera offset from spherical coordinates.
 * - distance: how far from target
 * - azimuth: horizontal angle (radians, 0 = behind player)
 * - elevation: vertical angle (radians, 0 = ground level, PI/2 = straight up)
 *
 * @returns [x, y, z] offset from target position
 */
export function computeCameraOffset(
  distance: number,
  azimuth: number,
  elevation: number,
): [number, number, number] {
  const y = distance * Math.sin(elevation);
  const horizontalDist = distance * Math.cos(elevation);
  const x = horizontalDist * Math.sin(azimuth);
  const z = horizontalDist * Math.cos(azimuth);
  return [x, y, z];
}

export const CAMERA_DEFAULTS = {
  minDistance: 5,
  maxDistance: 30,
  defaultDistance: 14.4, // ~sqrt(8^2 + 12^2) to match current offset
  defaultAzimuth: 0,
  defaultElevation: Math.atan2(8, 12), // ~0.588 rad, matches current y=8, z=12
  minElevation: 0.2,
  maxElevation: Math.PI / 2 - 0.1,
  zoomSpeed: 2,
  orbitSpeed: 0.005,
  keyboardOrbitSpeed: 2.0, // radians per second for Q/E rotation
};

/**
 * Clamp zoom distance between min and max.
 */
export function clampZoom(distance: number): number {
  return Math.max(
    CAMERA_DEFAULTS.minDistance,
    Math.min(CAMERA_DEFAULTS.maxDistance, distance),
  );
}

/**
 * Clamp elevation between min and max.
 */
export function clampElevation(elevation: number): number {
  return Math.max(
    CAMERA_DEFAULTS.minElevation,
    Math.min(CAMERA_DEFAULTS.maxElevation, elevation),
  );
}
