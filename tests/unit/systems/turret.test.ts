import { describe, it, expect } from "vitest";
import {
  findBestTarget,
  canTurretFire,
  computeTurretProjectile,
  getTurretProjectileColor,
} from "@game/systems/turretHelpers";
import { TURRETS } from "@shared/constants";
import type { TurretConfig } from "@shared/types";

describe("Turret Helpers", () => {
  const makeEnemy = (id: string, x: number, z: number, health = 30) => ({
    id,
    x,
    z,
    health,
  });

  describe("findBestTarget", () => {
    it("should return closest enemy within range", () => {
      const enemies = [
        makeEnemy("far", 20, 0),
        makeEnemy("close", 5, 0),
        makeEnemy("mid", 10, 0),
      ];
      const target = findBestTarget({ x: 0, z: 0 }, enemies, 15);
      expect(target?.id).toBe("close");
    });

    it("should return null when no enemies in range", () => {
      const enemies = [makeEnemy("far", 50, 50)];
      const target = findBestTarget({ x: 0, z: 0 }, enemies, 15);
      expect(target).toBeNull();
    });

    it("should ignore dead enemies", () => {
      const enemies = [
        makeEnemy("dead", 3, 0, 0),
        makeEnemy("alive", 10, 0, 30),
      ];
      const target = findBestTarget({ x: 0, z: 0 }, enemies, 15);
      expect(target?.id).toBe("alive");
    });

    it("should return null with empty enemy list", () => {
      const target = findBestTarget({ x: 0, z: 0 }, [], 15);
      expect(target).toBeNull();
    });
  });

  describe("canTurretFire", () => {
    it("should allow firing when cooldown elapsed", () => {
      // attackSpeed=2 means 500ms cooldown
      expect(canTurretFire(0, 2, 600)).toBe(true);
    });

    it("should prevent firing during cooldown", () => {
      expect(canTurretFire(0, 2, 400)).toBe(false);
    });

    it("should allow firing at exact cooldown boundary", () => {
      expect(canTurretFire(0, 2, 500)).toBe(true);
    });

    it("should handle different attack speeds", () => {
      // attackSpeed=0.5 means 2000ms cooldown
      expect(canTurretFire(0, 0.5, 1999)).toBe(false);
      expect(canTurretFire(0, 0.5, 2000)).toBe(true);
    });
  });

  describe("computeTurretProjectile", () => {
    const config: TurretConfig = {
      type: "basic_turret",
      cost: 500,
      damage: 15,
      attackSpeed: 2,
      range: 15,
      unlockedAtPhase: 0,
    };

    it("should create a valid ProjectileRequest", () => {
      const proj = computeTurretProjectile(
        [10, 0, 10],
        [20, 0, 10],
        config,
      );
      expect(proj.start[0]).toBe(10);
      expect(proj.start[1]).toBeGreaterThan(0); // elevated barrel
      expect(proj.start[2]).toBe(10);
      expect(proj.target).toEqual([20, 0, 10]);
      expect(proj.damage).toBe(15);
      expect(proj.speed).toBeGreaterThan(0);
      expect(proj.color).toBeTruthy();
    });
  });

  describe("getTurretProjectileColor", () => {
    it("should return different colors for different turret types", () => {
      const basic = getTurretProjectileColor("basic_turret");
      const laser = getTurretProjectileColor("laser_turret");
      const arty = getTurretProjectileColor("artillery");
      expect(basic).toBeTruthy();
      expect(laser).toBeTruthy();
      expect(arty).toBeTruthy();
      expect(laser).not.toBe(basic);
    });
  });

  describe("turret config validation", () => {
    it("all turrets should have positive damage", () => {
      for (const [, config] of Object.entries(TURRETS)) {
        expect(config.damage).toBeGreaterThan(0);
      }
    });

    it("all turrets should have positive attack speed", () => {
      for (const [, config] of Object.entries(TURRETS)) {
        expect(config.attackSpeed).toBeGreaterThan(0);
      }
    });

    it("all turrets should have positive range", () => {
      for (const [, config] of Object.entries(TURRETS)) {
        expect(config.range).toBeGreaterThan(0);
      }
    });

    it("all turrets should have positive cost", () => {
      for (const [, config] of Object.entries(TURRETS)) {
        expect(config.cost).toBeGreaterThan(0);
      }
    });

    it("artillery should have the widest range", () => {
      const artilleryRange = TURRETS.artillery.range;
      for (const [name, config] of Object.entries(TURRETS)) {
        if (name !== "artillery") {
          expect(artilleryRange).toBeGreaterThanOrEqual(config.range);
        }
      }
    });

    it("basic turret should be the cheapest", () => {
      const basicCost = TURRETS.basic_turret.cost;
      for (const [name, config] of Object.entries(TURRETS)) {
        if (name !== "basic_turret") {
          expect(config.cost).toBeGreaterThanOrEqual(basicCost);
        }
      }
    });
  });
});
