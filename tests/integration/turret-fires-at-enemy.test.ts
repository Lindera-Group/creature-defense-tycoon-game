/**
 * Integration test: Turret targeting and firing
 *
 * Tests the interaction between turret helpers, building store, and combat logic:
 * - Turret placed in store finds enemies via targeting helpers
 * - Respects cooldown timing
 * - Computes correct projectile data for different turret types
 * - Handles edge cases (no enemies, out of range, dead enemies)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useBuildingStore } from "@game/stores/buildingStore";
import {
  findBestTarget,
  canTurretFire,
  computeTurretProjectile,
  getTurretProjectileColor,
} from "@game/systems/turretHelpers";
import { TURRETS } from "@shared/constants";
import type { TurretType } from "@shared/types";

describe("Integration: Turret fires at enemy", () => {
  beforeEach(() => {
    useBuildingStore.getState().resetBuildings();
  });

  it("should find and target the closest enemy from a placed turret", () => {
    // Place a basic turret at (10, 0, 10)
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    const turret = useBuildingStore.getState().placedTurrets[0];

    // Simulate enemies at different distances
    const enemies = [
      { id: "e1", x: 15, z: 10, health: 30 }, // 5 units away
      { id: "e2", x: 12, z: 10, health: 30 }, // 2 units away (closest)
      { id: "e3", x: 20, z: 10, health: 30 }, // 10 units away
    ];

    const config = TURRETS[turret.type];
    const target = findBestTarget(
      { x: turret.position[0], z: turret.position[2] },
      enemies,
      config.range,
    );

    expect(target).not.toBeNull();
    expect(target!.id).toBe("e2"); // Closest enemy
  });

  it("should compute a valid projectile from turret to target", () => {
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    const turret = useBuildingStore.getState().placedTurrets[0];
    const config = TURRETS[turret.type];

    const targetPos: [number, number, number] = [15, 0, 10];

    const projectile = computeTurretProjectile(turret.position, targetPos, config);

    expect(projectile.start[0]).toBe(10); // turret x
    expect(projectile.start[1]).toBe(1.5); // barrel height
    expect(projectile.start[2]).toBe(10); // turret z
    expect(projectile.target).toEqual(targetPos);
    expect(projectile.damage).toBe(config.damage);
    expect(projectile.speed).toBe(20);
    expect(projectile.color).toBe("#FFD700"); // basic_turret gold
  });

  it("should respect cooldown between shots", () => {
    const config = TURRETS.basic_turret;

    // First shot should be allowed (last fire at 0, now at 1000)
    expect(canTurretFire(0, config.attackSpeed, 1000)).toBe(true);

    // Too soon after firing (200ms < 500ms cooldown)
    expect(canTurretFire(800, config.attackSpeed, 1000)).toBe(false);

    // Exactly at cooldown threshold
    expect(canTurretFire(500, config.attackSpeed, 1000)).toBe(true);

    // Well past cooldown
    expect(canTurretFire(0, config.attackSpeed, 5000)).toBe(true);
  });

  it("should ignore dead enemies when targeting", () => {
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    const turret = useBuildingStore.getState().placedTurrets[0];
    const config = TURRETS[turret.type];

    const enemies = [
      { id: "e1", x: 12, z: 10, health: 0 }, // Dead (closest)
      { id: "e2", x: 14, z: 10, health: 30 }, // Alive
    ];

    const target = findBestTarget(
      { x: turret.position[0], z: turret.position[2] },
      enemies,
      config.range,
    );

    expect(target!.id).toBe("e2"); // Skip dead enemy
  });

  it("should return null when no enemies are in range", () => {
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    const turret = useBuildingStore.getState().placedTurrets[0];
    const config = TURRETS[turret.type]; // range: 15

    const enemies = [
      { id: "e1", x: 50, z: 50, health: 30 }, // Way out of range
    ];

    const target = findBestTarget(
      { x: turret.position[0], z: turret.position[2] },
      enemies,
      config.range,
    );

    expect(target).toBeNull();
  });

  it("should produce different projectile colors per turret type", () => {
    const turretTypes: TurretType[] = ["basic_turret", "laser_turret", "artillery"];

    const colors = turretTypes.map((t) => getTurretProjectileColor(t));

    // Each type should have a distinct color
    expect(colors[0]).toBe("#FFD700"); // gold
    expect(colors[1]).toBe("#FF0000"); // red
    expect(colors[2]).toBe("#FF6600"); // orange

    // All different
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(3);
  });

  it("should simulate a full turret combat cycle: target -> cooldown check -> fire", () => {
    // Place artillery turret (slow fire rate, high damage, wide range)
    useBuildingStore.getState().placeTurret("artillery", [0, 0, 0]);
    const turret = useBuildingStore.getState().placedTurrets[0];
    const config = TURRETS[turret.type];

    const enemies = [
      { id: "e1", x: 20, z: 0, health: 100 },
      { id: "e2", x: 10, z: 0, health: 100 },
    ];

    // Step 1: Find target
    const target = findBestTarget(
      { x: turret.position[0], z: turret.position[2] },
      enemies,
      config.range,
    );
    expect(target!.id).toBe("e2"); // closest

    // Step 2: Check cooldown (first shot, always ready)
    const now = 5000;
    const lastFireTime = 0;
    expect(canTurretFire(lastFireTime, config.attackSpeed, now)).toBe(true);

    // Step 3: Compute projectile
    const projectile = computeTurretProjectile(
      turret.position,
      [target!.x, 0, target!.z],
      config,
    );
    expect(projectile.damage).toBe(100); // artillery damage
    expect(projectile.color).toBe("#FF6600"); // orange

    // Step 4: After firing, cooldown should block immediate refire
    // Artillery attackSpeed = 0.5, so cooldown = 2000ms
    const cooldown = 1000 / config.attackSpeed;
    expect(cooldown).toBe(2000);
    expect(canTurretFire(now, config.attackSpeed, now + 500)).toBe(false);
    expect(canTurretFire(now, config.attackSpeed, now + 2000)).toBe(true);
  });
});
