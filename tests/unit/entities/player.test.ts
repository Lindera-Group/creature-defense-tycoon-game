import { describe, it, expect } from "vitest";
import {
  computeMovementVelocity,
  clampPosition,
  computeRotation,
  isPastWorldEdge,
  PLAYER_BOUNDS,
  WORLD_RADIUS,
  SPRINT_MULTIPLIER,
  PLAYER_SPEED,
} from "@game/entities/playerHelpers";

const k = (keys: { w?: boolean; a?: boolean; s?: boolean; d?: boolean; shift?: boolean }) => ({
  w: false, a: false, s: false, d: false, shift: false, ...keys,
});

describe("Player Character", () => {
  describe("computeMovementVelocity", () => {
    it("WASD input produces correct velocity direction", () => {
      const forward = computeMovementVelocity(k({ w: true }));
      expect(forward.x).toBe(0);
      expect(forward.z).toBeLessThan(0);

      const backward = computeMovementVelocity(k({ s: true }));
      expect(backward.x).toBe(0);
      expect(backward.z).toBeGreaterThan(0);

      const left = computeMovementVelocity(k({ a: true }));
      expect(left.x).toBeLessThan(0);
      expect(left.z).toBe(0);

      const right = computeMovementVelocity(k({ d: true }));
      expect(right.x).toBeGreaterThan(0);
      expect(right.z).toBe(0);
    });

    it("diagonal movement is normalized (not sqrt(2) faster)", () => {
      const diagonal = computeMovementVelocity(k({ w: true, d: true }));
      const magnitude = Math.sqrt(diagonal.x * diagonal.x + diagonal.z * diagonal.z);
      expect(magnitude).toBeCloseTo(1, 3);
    });

    it("no input produces zero velocity", () => {
      const none = computeMovementVelocity(k({}));
      expect(none.x).toBe(0);
      expect(none.z).toBe(0);
    });

    it("opposing inputs cancel out", () => {
      const cancelWS = computeMovementVelocity(k({ w: true, s: true }));
      expect(cancelWS.x).toBe(0);
      expect(cancelWS.z).toBe(0);

      const cancelAD = computeMovementVelocity(k({ a: true, d: true }));
      expect(cancelAD.x).toBe(0);
      expect(cancelAD.z).toBe(0);
    });
  });

  describe("clampPosition", () => {
    it("position is passed through (no clamping)", () => {
      const pos = clampPosition(5, 0, 5);
      expect(pos).toEqual({ x: 5, y: 0, z: 5 });
    });

    it("far positions are not clamped (player can walk off edge)", () => {
      const pos = clampPosition(100, 0, -100);
      expect(pos.x).toBe(100);
      expect(pos.z).toBe(-100);
    });
  });

  describe("isPastWorldEdge", () => {
    it("returns false inside the world", () => {
      expect(isPastWorldEdge(0, 0)).toBe(false);
      expect(isPastWorldEdge(50, 50)).toBe(false);
    });

    it("returns true past the world radius", () => {
      expect(isPastWorldEdge(WORLD_RADIUS, 0)).toBe(true);
      expect(isPastWorldEdge(0, WORLD_RADIUS)).toBe(true);
      expect(isPastWorldEdge(60, 60)).toBe(true); // ~84.9 > 80
    });
  });

  describe("sprint", () => {
    it("SPRINT_MULTIPLIER is greater than 1", () => {
      expect(SPRINT_MULTIPLIER).toBeGreaterThan(1);
    });

    it("sprint speed is PLAYER_SPEED * SPRINT_MULTIPLIER", () => {
      const sprintSpeed = PLAYER_SPEED * SPRINT_MULTIPLIER;
      expect(sprintSpeed).toBeGreaterThan(PLAYER_SPEED);
    });
  });

  describe("computeRotation", () => {
    it("player rotates to face movement direction", () => {
      const forwardRot = computeRotation({ x: 0, z: -1 });
      expect(Math.abs(forwardRot!)).toBeCloseTo(Math.PI, 1);

      const rightRot = computeRotation({ x: 1, z: 0 });
      expect(rightRot).toBeCloseTo(Math.PI / 2, 1);

      const leftRot = computeRotation({ x: -1, z: 0 });
      expect(leftRot).toBeCloseTo(-Math.PI / 2, 1);
    });

    it("returns null when no movement (no direction to face)", () => {
      const rot = computeRotation({ x: 0, z: 0 });
      expect(rot).toBeNull();
    });
  });

  describe("PLAYER_BOUNDS", () => {
    it("matches expected circular world bounds", () => {
      expect(PLAYER_BOUNDS).toBe(WORLD_RADIUS - 2);
    });
  });
});
