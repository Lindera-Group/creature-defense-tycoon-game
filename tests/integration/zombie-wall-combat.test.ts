/**
 * Integration test: Zombie wall combat
 *
 * Tests the interaction between fortification helpers and building store:
 * - Zombie detects a wall in its path (fortificationHelpers)
 * - Zombie attacks wall (buildingStore.damageFortification)
 * - Wall health decreases and eventually gets destroyed
 * - After wall destruction, path is clear again
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useBuildingStore } from "@game/stores/buildingStore";
import { findFortificationInPath } from "@game/systems/fortificationHelpers";

describe("Integration: Zombie wall combat", () => {
  beforeEach(() => {
    useBuildingStore.getState().resetBuildings();
  });

  it("should detect a wall blocking the path from enemy to player", () => {
    // Place a wooden fence between zombie and player
    useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 0]);

    const forts = useBuildingStore.getState().placedFortifications;
    const fortTargets = forts.map((f) => ({
      id: f.id,
      position: f.position,
      health: f.health,
    }));

    // Enemy at x=10, heading toward player at x=0
    const blocking = findFortificationInPath(
      { x: 10, z: 0 },
      { x: 0, z: 0 },
      fortTargets,
      1.5, // hit radius
    );

    expect(blocking).not.toBeNull();
    expect(blocking!.id).toBe(forts[0].id);
  });

  it("should attack wall until destroyed, then find path clear", () => {
    useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 0]);
    const id = useBuildingStore.getState().placedFortifications[0].id;

    // Simulate zombie attacks (wooden_fence: 100 hp, zombie damage ~8-20 per hit)
    const zombieDamage = 10;
    let hits = 0;

    while (useBuildingStore.getState().placedFortifications.length > 0) {
      useBuildingStore.getState().damageFortification(id, zombieDamage);
      hits++;
    }

    expect(hits).toBe(10); // 100 / 10 = 10 hits to destroy

    // After destruction, path should be clear
    const fortTargets = useBuildingStore.getState().placedFortifications.map((f) => ({
      id: f.id,
      position: f.position,
      health: f.health,
    }));

    const blocking = findFortificationInPath(
      { x: 10, z: 0 },
      { x: 0, z: 0 },
      fortTargets,
      1.5,
    );

    expect(blocking).toBeNull();
  });

  it("should attack nearest wall first when multiple walls block path", () => {
    // Place two walls between enemy and player
    useBuildingStore.getState().placeFortification("wooden_fence", [8, 0, 0]); // closer to enemy
    useBuildingStore.getState().placeFortification("stone_wall", [3, 0, 0]); // closer to player

    const forts = useBuildingStore.getState().placedFortifications;
    const fortTargets = forts.map((f) => ({
      id: f.id,
      position: f.position,
      health: f.health,
    }));

    // Enemy at x=12, heading to player at x=0
    const blocking = findFortificationInPath(
      { x: 12, z: 0 },
      { x: 0, z: 0 },
      fortTargets,
      1.5,
    );

    // Should target the closer wall (at x=8)
    expect(blocking).not.toBeNull();
    expect(blocking!.id).toBe(forts[0].id); // wooden_fence at x=8
  });

  it("should ignore walls that are not in the path", () => {
    // Place wall far off to the side
    useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 20]);

    const forts = useBuildingStore.getState().placedFortifications;
    const fortTargets = forts.map((f) => ({
      id: f.id,
      position: f.position,
      health: f.health,
    }));

    // Enemy at x=10, heading to player at x=0 (both z=0)
    const blocking = findFortificationInPath(
      { x: 10, z: 0 },
      { x: 0, z: 0 },
      fortTargets,
      1.5,
    );

    expect(blocking).toBeNull();
  });

  it("should handle stone wall taking more hits than wooden fence", () => {
    useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 0]);
    const id = useBuildingStore.getState().placedFortifications[0].id;

    // Stone wall has 500 hp
    const zombieDamage = 10;
    let hits = 0;

    while (useBuildingStore.getState().placedFortifications.length > 0) {
      useBuildingStore.getState().damageFortification(id, zombieDamage);
      hits++;
    }

    expect(hits).toBe(50); // 500 / 10 = 50 hits
  });

  it("should handle wall destruction revealing second wall behind it", () => {
    useBuildingStore.getState().placeFortification("wooden_fence", [8, 0, 0]); // first wall
    useBuildingStore.getState().placeFortification("wooden_fence", [4, 0, 0]); // second wall

    const firstWallId = useBuildingStore.getState().placedFortifications[0].id;

    // Destroy first wall
    useBuildingStore.getState().damageFortification(firstWallId, 100);
    expect(useBuildingStore.getState().placedFortifications).toHaveLength(1);

    // Second wall should now be detected
    const forts = useBuildingStore.getState().placedFortifications;
    const fortTargets = forts.map((f) => ({
      id: f.id,
      position: f.position,
      health: f.health,
    }));

    const blocking = findFortificationInPath(
      { x: 10, z: 0 },
      { x: 0, z: 0 },
      fortTargets,
      1.5,
    );

    expect(blocking).not.toBeNull();
    expect(blocking!.position[0]).toBe(4); // The wall at x=4
  });
});
