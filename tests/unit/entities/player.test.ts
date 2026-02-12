import { describe, it, expect } from "vitest";
import {
  computeMovementVelocity,
  clampPosition,
  computeRotation,
  PLAYER_BOUNDS,
} from "@game/entities/playerHelpers";

describe("Player Character", () => {
  describe("computeMovementVelocity", () => {
    it("WASD input produces correct velocity direction", () => {
      // W = forward (negative Z in Three.js)
      const forward = computeMovementVelocity({ w: true, a: false, s: false, d: false });
      expect(forward.x).toBe(0);
      expect(forward.z).toBeLessThan(0);

      // S = backward (positive Z)
      const backward = computeMovementVelocity({ w: false, a: false, s: true, d: false });
      expect(backward.x).toBe(0);
      expect(backward.z).toBeGreaterThan(0);

      // A = left (negative X)
      const left = computeMovementVelocity({ w: false, a: true, s: false, d: false });
      expect(left.x).toBeLessThan(0);
      expect(left.z).toBe(0);

      // D = right (positive X)
      const right = computeMovementVelocity({ w: false, a: false, s: false, d: true });
      expect(right.x).toBeGreaterThan(0);
      expect(right.z).toBe(0);
    });

    it("diagonal movement is normalized (not sqrt(2) faster)", () => {
      const diagonal = computeMovementVelocity({ w: true, a: false, s: false, d: true });
      const magnitude = Math.sqrt(diagonal.x * diagonal.x + diagonal.z * diagonal.z);
      // Should be approximately 1 (normalized), not sqrt(2)
      expect(magnitude).toBeCloseTo(1, 3);
    });

    it("no input produces zero velocity", () => {
      const none = computeMovementVelocity({ w: false, a: false, s: false, d: false });
      expect(none.x).toBe(0);
      expect(none.z).toBe(0);
    });

    it("opposing inputs cancel out", () => {
      const cancelWS = computeMovementVelocity({ w: true, a: false, s: true, d: false });
      expect(cancelWS.x).toBe(0);
      expect(cancelWS.z).toBe(0);

      const cancelAD = computeMovementVelocity({ w: false, a: true, s: false, d: true });
      expect(cancelAD.x).toBe(0);
      expect(cancelAD.z).toBe(0);
    });
  });

  describe("clampPosition", () => {
    it("position within bounds is unchanged", () => {
      const pos = clampPosition(5, 0, 5);
      expect(pos).toEqual({ x: 5, y: 0, z: 5 });
    });

    it("position is clamped to PLAYER_BOUNDS", () => {
      const pos = clampPosition(100, 0, -100);
      expect(pos.x).toBe(PLAYER_BOUNDS);
      expect(pos.z).toBe(-PLAYER_BOUNDS);
    });

    it("negative bounds are also enforced", () => {
      const pos = clampPosition(-100, 0, 100);
      expect(pos.x).toBe(-PLAYER_BOUNDS);
      expect(pos.z).toBe(PLAYER_BOUNDS);
    });
  });

  describe("computeRotation", () => {
    it("player rotates to face movement direction", () => {
      // Moving forward (negative Z) -> rotation should be PI or -PI (facing -Z)
      const forwardRot = computeRotation({ x: 0, z: -1 });
      // PI and -PI are equivalent rotations
      expect(Math.abs(forwardRot!)).toBeCloseTo(Math.PI, 1);

      // Moving right (positive X) -> rotation should be PI/2
      const rightRot = computeRotation({ x: 1, z: 0 });
      expect(rightRot).toBeCloseTo(Math.PI / 2, 1);

      // Moving left (negative X) -> rotation should be -PI/2
      const leftRot = computeRotation({ x: -1, z: 0 });
      expect(leftRot).toBeCloseTo(-Math.PI / 2, 1);
    });

    it("returns null when no movement (no direction to face)", () => {
      const rot = computeRotation({ x: 0, z: 0 });
      expect(rot).toBeNull();
    });
  });

  describe("PLAYER_BOUNDS", () => {
    it("matches expected world bounds constraint", () => {
      // Ground is 80x80, so half is 40, minus 2 margin = 38
      expect(PLAYER_BOUNDS).toBe(38);
    });
  });
});
