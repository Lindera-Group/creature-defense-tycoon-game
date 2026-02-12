import { describe, it, expect } from "vitest";
import {
  getHealthBarColor,
  getHealthBarWidth,
  formatWaveText,
} from "@game/ui/hudHelpers";

describe("HUD", () => {
  describe("getHealthBarColor", () => {
    it("returns green when health > 50%", () => {
      expect(getHealthBarColor(80, 100)).toBe("#4CAF50");
      expect(getHealthBarColor(51, 100)).toBe("#4CAF50");
    });

    it("returns yellow when health 25-50%", () => {
      expect(getHealthBarColor(50, 100)).toBe("#FFC107");
      expect(getHealthBarColor(25, 100)).toBe("#FFC107");
    });

    it("returns red when health < 25%", () => {
      expect(getHealthBarColor(24, 100)).toBe("#F44336");
      expect(getHealthBarColor(1, 100)).toBe("#F44336");
      expect(getHealthBarColor(0, 100)).toBe("#F44336");
    });
  });

  describe("getHealthBarWidth", () => {
    it("returns percentage string", () => {
      expect(getHealthBarWidth(100, 100)).toBe("100%");
      expect(getHealthBarWidth(50, 100)).toBe("50%");
      expect(getHealthBarWidth(0, 100)).toBe("0%");
    });

    it("clamps to 0-100%", () => {
      expect(getHealthBarWidth(-10, 100)).toBe("0%");
    });
  });

  describe("formatWaveText", () => {
    it("shows wave number during active wave", () => {
      expect(formatWaveText(3, true)).toBe("Wave 3");
    });

    it("shows Get Ready when game started but wave 0", () => {
      expect(formatWaveText(0, true)).toBe("Get Ready!");
    });

    it("shows nothing when game not started", () => {
      expect(formatWaveText(0, false)).toBe("");
    });
  });
});
