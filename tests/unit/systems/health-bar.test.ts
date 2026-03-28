import { describe, it, expect } from "vitest";
import { getHealthBarColor } from "@game/systems/healthBarHelpers";

describe("Health bar color helper", () => {
  it("returns green when health > 60%", () => {
    expect(getHealthBarColor(1.0)).toBe(0x4caf50);
    expect(getHealthBarColor(0.8)).toBe(0x4caf50);
    expect(getHealthBarColor(0.61)).toBe(0x4caf50);
  });

  it("returns yellow when health 31-60%", () => {
    expect(getHealthBarColor(0.6)).toBe(0xffeb3b);
    expect(getHealthBarColor(0.5)).toBe(0xffeb3b);
    expect(getHealthBarColor(0.31)).toBe(0xffeb3b);
  });

  it("returns red when health <= 30%", () => {
    expect(getHealthBarColor(0.3)).toBe(0xf44336);
    expect(getHealthBarColor(0.1)).toBe(0xf44336);
    expect(getHealthBarColor(0)).toBe(0xf44336);
  });
});
