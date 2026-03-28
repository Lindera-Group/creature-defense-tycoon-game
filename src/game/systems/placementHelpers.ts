export const TREE_COLLISION_RADIUS = 1.2;
export const BUILDING_COLLISION_RADIUS = 1.5;
export const WORLD_BOUNDS = 75; // Circular placement radius
export const MIN_DISTANCE_FROM_ORIGIN = 3;
export const DEFAULT_GRID_SIZE = 2;

/**
 * Check if a position is valid for placing a building.
 * Must not overlap trees, existing buildings, be out of bounds,
 * or be too close to the spawn origin.
 */
export function isValidPlacement(
  x: number,
  z: number,
  existingBuildings: Array<{ position: [number, number, number] }>,
  treePositions: Array<[number, number]>,
): boolean {
  // Check circular world bounds
  if (Math.sqrt(x * x + z * z) > WORLD_BOUNDS) {
    return false;
  }

  // Check distance from origin (protect spawn area)
  const distFromOrigin = Math.sqrt(x * x + z * z);
  if (distFromOrigin < MIN_DISTANCE_FROM_ORIGIN) {
    return false;
  }

  // Check tree collisions
  for (const [tx, tz] of treePositions) {
    const dx = x - tx;
    const dz = z - tz;
    if (dx * dx + dz * dz < TREE_COLLISION_RADIUS * TREE_COLLISION_RADIUS) {
      return false;
    }
  }

  // Check building collisions
  for (const building of existingBuildings) {
    const dx = x - building.position[0];
    const dz = z - building.position[2];
    if (dx * dx + dz * dz < BUILDING_COLLISION_RADIUS * BUILDING_COLLISION_RADIUS) {
      return false;
    }
  }

  return true;
}

/**
 * Snap coordinates to a grid for clean placement aesthetics.
 * Default grid size is 2 units.
 */
export function snapToGrid(x: number, z: number, gridSize: number = 2): [number, number] {
  return [
    Math.round(x / gridSize) * gridSize,
    Math.round(z / gridSize) * gridSize,
  ];
}
