import { describe, it, expect } from "vitest";
import { ENEMIES } from "@shared/constants";
import {
  moveTowardPlayer,
  isInAttackRange,
  computeZombieDamage,
  findNearestTarget,
} from "@game/entities/zombieHelpers";
import type { TargetableEntity } from "@game/entities/zombieHelpers";

describe("Green Zombie", () => {
  const config = ENEMIES.zombie_green;

  describe("stats", () => {
    it("has 30 HP", () => {
      expect(config.health).toBe(30);
    });

    it("moves at 1.5 units/sec", () => {
      expect(config.speed).toBe(1.5);
    });

    it("deals 2 damage per hit", () => {
      expect(config.damage).toBe(2);
    });

    it("attacks 0.7 times per second", () => {
      expect(config.attackSpeed).toBe(0.7);
    });

    it("drops coins in [5, 10] range", () => {
      expect(config.coinDrop).toEqual([5, 10]);
    });
  });

  describe("moveTowardPlayer", () => {
    it("moves toward player position at correct speed", () => {
      const result = moveTowardPlayer(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        config.speed,
        1 / 60,
      );
      // Should move in -X direction (toward player)
      expect(result.x).toBeLessThan(10);
      expect(result.z).toBe(0);
    });

    it("faces player while moving", () => {
      const result = moveTowardPlayer(
        { x: 10, z: 0 },
        { x: 0, z: 0 },
        config.speed,
        1 / 60,
      );
      // Rotation should face toward player (-X direction)
      expect(result.rotation).toBeDefined();
    });

    it("stops at attack range", () => {
      const attackRange = 1.5;
      const result = moveTowardPlayer(
        { x: attackRange + 0.1, z: 0 },
        { x: 0, z: 0 },
        config.speed,
        1 / 60,
        attackRange,
      );
      // Should not move past attack range
      const dist = Math.sqrt(result.x * result.x + result.z * result.z);
      expect(dist).toBeGreaterThanOrEqual(attackRange - 0.01);
    });
  });

  describe("isInAttackRange", () => {
    it("returns true when within range", () => {
      expect(isInAttackRange({ x: 1, z: 0 }, { x: 0, z: 0 }, 1.5)).toBe(true);
    });

    it("returns false when out of range", () => {
      expect(isInAttackRange({ x: 5, z: 0 }, { x: 0, z: 0 }, 1.5)).toBe(false);
    });
  });

  describe("computeZombieDamage", () => {
    it("returns damage when cooldown elapsed", () => {
      const result = computeZombieDamage(config.damage, config.attackSpeed, 0, 2000);
      expect(result.damage).toBe(config.damage);
      expect(result.attacked).toBe(true);
    });

    it("returns 0 when on cooldown", () => {
      const result = computeZombieDamage(config.damage, config.attackSpeed, 500, 800);
      expect(result.damage).toBe(0);
      expect(result.attacked).toBe(false);
    });
  });
});

describe("findNearestTarget", () => {
  const zombiePos = { x: 0, z: 0 };

  it("returns null for empty target list", () => {
    expect(findNearestTarget(zombiePos, [])).toBeNull();
  });

  it("returns player when no buildings are present", () => {
    const targets: TargetableEntity[] = [
      { type: "player", id: "player", x: 5, z: 0 },
    ];
    const result = findNearestTarget(zombiePos, targets);
    expect(result?.type).toBe("player");
    expect(result?.id).toBe("player");
  });

  it("returns nearest turret when closer than player", () => {
    const targets: TargetableEntity[] = [
      { type: "player", id: "player", x: 10, z: 0 },
      { type: "turret", id: "turret_1", x: 3, z: 0 },
    ];
    const result = findNearestTarget(zombiePos, targets);
    expect(result?.type).toBe("turret");
    expect(result?.id).toBe("turret_1");
  });

  it("returns nearest fortification when it is the closest entity", () => {
    const targets: TargetableEntity[] = [
      { type: "player", id: "player", x: 8, z: 0 },
      { type: "turret", id: "turret_1", x: 5, z: 0 },
      { type: "fortification", id: "fort_0", x: 2, z: 0 },
    ];
    const result = findNearestTarget(zombiePos, targets);
    expect(result?.type).toBe("fortification");
    expect(result?.id).toBe("fort_0");
  });

  it("returns player when player is the closest entity", () => {
    const targets: TargetableEntity[] = [
      { type: "player", id: "player", x: 1, z: 0 },
      { type: "turret", id: "turret_1", x: 6, z: 0 },
      { type: "fortification", id: "fort_0", x: 4, z: 4 },
    ];
    const result = findNearestTarget(zombiePos, targets);
    expect(result?.type).toBe("player");
  });

  it("handles targets in all quadrants and finds closest by Euclidean distance", () => {
    const targets: TargetableEntity[] = [
      { type: "turret", id: "turret_ne", x: 3, z: 3 },   // dist² = 18
      { type: "fortification", id: "fort_sw", x: -2, z: -2 }, // dist² = 8
      { type: "player", id: "player", x: -1, z: 0 },     // dist² = 1
    ];
    const result = findNearestTarget(zombiePos, targets);
    expect(result?.id).toBe("player");
  });
});
