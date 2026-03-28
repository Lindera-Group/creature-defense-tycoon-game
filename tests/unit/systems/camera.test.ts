import { describe, it, expect } from "vitest";
import {
  computeCameraOffset,
  clampZoom,
  clampElevation,
  CAMERA_DEFAULTS,
} from "@game/systems/cameraHelpers";

describe("Camera helpers", () => {
  describe("computeCameraOffset", () => {
    it("at default position matches original offset approximately", () => {
      const [x, y, z] = computeCameraOffset(
        CAMERA_DEFAULTS.defaultDistance,
        CAMERA_DEFAULTS.defaultAzimuth,
        CAMERA_DEFAULTS.defaultElevation,
      );
      expect(x).toBeCloseTo(0, 0); // azimuth 0 means no x offset
      expect(y).toBeCloseTo(8, 0);
      expect(z).toBeCloseTo(12, 0);
    });

    it("looking straight up gives maximum y", () => {
      const [x, y, z] = computeCameraOffset(10, 0, Math.PI / 2);
      expect(y).toBeCloseTo(10, 0);
      expect(Math.abs(x)).toBeLessThan(0.1);
      expect(Math.abs(z)).toBeLessThan(0.1);
    });

    it("orbiting 90 degrees rotates x/z", () => {
      const [x, , z] = computeCameraOffset(10, Math.PI / 2, 0);
      expect(x).toBeCloseTo(10, 0);
      expect(Math.abs(z)).toBeLessThan(0.1);
    });
  });

  describe("clampZoom", () => {
    it("keeps value within range", () => {
      expect(clampZoom(10)).toBe(10);
    });

    it("clamps to min", () => {
      expect(clampZoom(1)).toBe(CAMERA_DEFAULTS.minDistance);
    });

    it("clamps to max", () => {
      expect(clampZoom(100)).toBe(CAMERA_DEFAULTS.maxDistance);
    });
  });

  describe("clampElevation", () => {
    it("keeps value within range", () => {
      expect(clampElevation(0.5)).toBe(0.5);
    });

    it("clamps to min", () => {
      expect(clampElevation(0)).toBe(CAMERA_DEFAULTS.minElevation);
    });

    it("clamps to max", () => {
      expect(clampElevation(2)).toBe(CAMERA_DEFAULTS.maxElevation);
    });
  });
});
