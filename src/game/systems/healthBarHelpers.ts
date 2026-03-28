/**
 * Get health bar color hex based on health percentage.
 * Green (>60%), Yellow (>30%), Red (<=30%)
 */
export function getHealthBarColor(healthPercent: number): number {
  if (healthPercent > 0.6) return 0x4caf50; // Green
  if (healthPercent > 0.3) return 0xffeb3b; // Yellow
  return 0xf44336; // Red
}
