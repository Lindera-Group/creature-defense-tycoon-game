import { describe, it, expect } from "vitest";
import { WEAPONS, TURRETS, FORTIFICATIONS } from "@shared/constants";

/**
 * Balance Tweaks: Playtest Feedback (RED phase)
 *
 * Requested changes based on playtesting:
 * 1. Rifle nerf: damage 40→30, range 40→30
 * 2. All building prices increase 25-35%, rounded to nice numbers
 *
 * These tests MUST FAIL initially to demonstrate current values.
 */

describe("Balance tweaks: Playtest feedback", () => {
  describe("Rifle nerf (too powerful at current stats)", () => {
    it("should have damage 30 (was 40)", () => {
      expect(WEAPONS.rifle.damage).toBe(30);
    });

    it("should have range 30 (was 40)", () => {
      expect(WEAPONS.rifle.range).toBe(30);
    });
  });

  describe("Building price increases (25-35% increase)", () => {
    describe("Turrets", () => {
      it("basic_turret costs 650 (was 500, +30%)", () => {
        expect(TURRETS.basic_turret.cost).toBe(650);
      });

      it("laser_turret costs 2500 (was 2000, +25%)", () => {
        expect(TURRETS.laser_turret.cost).toBe(2500);
      });

      it("artillery costs 6500 (was 5000, +30%)", () => {
        expect(TURRETS.artillery.cost).toBe(6500);
      });

      it("silver_turret costs 4000 (was 3000, +33%)", () => {
        expect(TURRETS.silver_turret.cost).toBe(4000);
      });

      it("holy_cannon costs 10000 (was 8000, +25%)", () => {
        expect(TURRETS.holy_cannon.cost).toBe(10000);
      });
    });

    describe("Fortifications", () => {
      it("wooden_fence costs 65 (was 50, +30%)", () => {
        expect(FORTIFICATIONS.wooden_fence.cost).toBe(65);
      });

      it("stone_wall costs 250 (was 200, +25%)", () => {
        expect(FORTIFICATIONS.stone_wall.cost).toBe(250);
      });

      it("watchtower costs 650 (was 500, +30%)", () => {
        expect(FORTIFICATIONS.watchtower.cost).toBe(650);
      });

      it("fort costs 2500 (was 2000, +25%)", () => {
        expect(FORTIFICATIONS.fort.cost).toBe(2500);
      });

      it("castle costs 6500 (was 5000, +30%)", () => {
        expect(FORTIFICATIONS.castle.cost).toBe(6500);
      });

      it("mega_fortress costs 13000 (was 10000, +30%)", () => {
        expect(FORTIFICATIONS.mega_fortress.cost).toBe(13000);
      });
    });
  });
});
