import { describe, it, expect } from "vitest";
import { computeCoinOpacity, isCoinExpired, COIN_LIFETIME, COIN_BLINK_START } from "@game/systems/coinHelpers";

describe("Coin despawn system", () => {
  it("coin is fully opaque when young (0-25s)", () => {
    expect(computeCoinOpacity(0)).toBe(1);
    expect(computeCoinOpacity(10)).toBe(1);
    expect(computeCoinOpacity(24.9)).toBe(1);
  });

  it("coin blinks between 25-35s (alternates 1.0 and 0.3)", () => {
    // At some point in the blink range, opacity should be 0.3
    const opacities: number[] = [];
    for (let t = COIN_BLINK_START; t < COIN_LIFETIME; t += 0.05) {
      opacities.push(computeCoinOpacity(t));
    }
    expect(opacities).toContain(1.0);
    expect(opacities).toContain(0.3);
  });

  it("coin is invisible at 35s (expired)", () => {
    expect(computeCoinOpacity(35)).toBe(0);
    expect(computeCoinOpacity(40)).toBe(0);
  });

  it("isCoinExpired returns false before 35s", () => {
    expect(isCoinExpired(0)).toBe(false);
    expect(isCoinExpired(34.9)).toBe(false);
  });

  it("isCoinExpired returns true at 35s+", () => {
    expect(isCoinExpired(35)).toBe(true);
    expect(isCoinExpired(50)).toBe(true);
  });

  it("COIN_LIFETIME is 35", () => {
    expect(COIN_LIFETIME).toBe(35);
  });

  it("COIN_BLINK_START is 25", () => {
    expect(COIN_BLINK_START).toBe(25);
  });
});
