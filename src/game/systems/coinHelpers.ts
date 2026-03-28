export const COIN_LIFETIME = 35; // seconds
export const COIN_BLINK_START = 25; // seconds - start blinking

/**
 * Compute coin opacity based on age.
 * - 0 to COIN_BLINK_START: fully opaque (1.0)
 * - COIN_BLINK_START to COIN_LIFETIME: blinks (alternating 1.0 and 0.3)
 * - Past COIN_LIFETIME: 0 (expired)
 */
export function computeCoinOpacity(ageSeconds: number): number {
  if (ageSeconds >= COIN_LIFETIME) return 0;
  if (ageSeconds < COIN_BLINK_START) return 1;
  // Blink: alternate between 1.0 and 0.3 using sin wave (~2 blinks per second)
  const blinkPhase = Math.sin(ageSeconds * Math.PI * 4); // 2 Hz
  return blinkPhase > 0 ? 1.0 : 0.3;
}

/**
 * Check if a coin has expired.
 */
export function isCoinExpired(ageSeconds: number): boolean {
  return ageSeconds >= COIN_LIFETIME;
}
