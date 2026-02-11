import { describe, it, expect } from "vitest";

describe("Test infrastructure", () => {
  it("should run tests", () => {
    expect(true).toBe(true);
  });

  it("should have access to shared types", async () => {
    const types = await import("@shared/types");
    expect(types).toBeDefined();
  });

  it("should have access to shared constants", async () => {
    const constants = await import("@shared/constants");
    expect(constants.PLAYER_DEFAULTS.health).toBe(100);
    expect(constants.ENEMIES.zombie_green.health).toBe(30);
  });
});
