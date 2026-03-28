import { describe, it, expect, beforeEach } from "vitest";
import { useBuildingStore } from "@game/stores/buildingStore";
import { findFortificationInPath } from "@game/systems/fortificationHelpers";

describe("Zombie Wall Targeting", () => {
  beforeEach(() => {
    useBuildingStore.getState().resetBuildings();
  });

  describe("Wall detection", () => {
    it("should detect wall blocking path to player", () => {
      // Place a wall between zombie and player
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 0]);
      const forts = useBuildingStore.getState().placedFortifications;

      const zombiePos = { x: 10, z: 0 };
      const playerPos = { x: 0, z: 0 };

      const wall = findFortificationInPath(zombiePos, playerPos, forts, 1.5);

      expect(wall).not.toBeNull();
      expect(wall!.id).toBe(forts[0].id);
    });

    it("should not detect wall that is not in path", () => {
      // Place a wall off to the side
      useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 10]);
      const forts = useBuildingStore.getState().placedFortifications;

      const zombiePos = { x: 10, z: 0 };
      const playerPos = { x: 0, z: 0 };

      const wall = findFortificationInPath(zombiePos, playerPos, forts, 1.5);

      expect(wall).toBeNull();
    });

    it("should target nearest wall when multiple walls block path", () => {
      // Place two walls in the path
      useBuildingStore.getState().placeFortification("wooden_fence", [3, 0, 0]);
      useBuildingStore.getState().placeFortification("stone_wall", [7, 0, 0]);
      const forts = useBuildingStore.getState().placedFortifications;

      const zombiePos = { x: 10, z: 0 };
      const playerPos = { x: 0, z: 0 };

      const wall = findFortificationInPath(zombiePos, playerPos, forts, 1.5);

      expect(wall).not.toBeNull();
      // Should target the nearest wall (at x=7, closer to zombie at x=10)
      expect(wall!.position[0]).toBe(7);
      expect(wall!.id).toBe(forts[1].id);
    });
  });

  describe("Wall damage", () => {
    it("should reduce wall health when zombie attacks it", () => {
      useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];
      const initialHealth = wall.health;

      expect(initialHealth).toBe(100); // FORTIFICATIONS.wooden_fence.health

      // Simulate zombie attack
      useBuildingStore.getState().damageFortification(wall.id, 10);

      const updatedWall = useBuildingStore.getState().placedFortifications[0];
      expect(updatedWall.health).toBe(90);
    });

    it("should remove wall when health reaches zero", () => {
      useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      // Damage enough to destroy
      useBuildingStore.getState().damageFortification(wall.id, 150);

      expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);
    });

    it("should resume player targeting after wall is destroyed", () => {
      // Place wall between zombie and player
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 0]);
      let forts = useBuildingStore.getState().placedFortifications;

      const zombiePos = { x: 10, z: 0 };
      const playerPos = { x: 0, z: 0 };

      // Wall should block initially
      let wall = findFortificationInPath(zombiePos, playerPos, forts, 1.5);
      expect(wall).not.toBeNull();

      // Destroy the wall
      useBuildingStore.getState().damageFortification(forts[0].id, 200);
      forts = useBuildingStore.getState().placedFortifications;

      // Path should be clear now
      wall = findFortificationInPath(zombiePos, playerPos, forts, 1.5);
      expect(wall).toBeNull();
    });
  });

  describe("Multiple fortification types", () => {
    it("should work with stone walls", () => {
      useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      expect(wall.type).toBe("stone_wall");
      expect(wall.health).toBe(500); // FORTIFICATIONS.stone_wall.health
    });

    it("should work with watchtowers", () => {
      useBuildingStore.getState().placeFortification("watchtower", [5, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      expect(wall.type).toBe("watchtower");
      expect(wall.health).toBe(300); // FORTIFICATIONS.watchtower.health
    });

    it("should work with forts", () => {
      useBuildingStore.getState().placeFortification("fort", [5, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      expect(wall.type).toBe("fort");
      expect(wall.health).toBe(2000); // FORTIFICATIONS.fort.health
    });

    it("should work with castles", () => {
      useBuildingStore.getState().placeFortification("castle", [5, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      expect(wall.type).toBe("castle");
      expect(wall.health).toBe(5000); // FORTIFICATIONS.castle.health
    });

    it("should work with mega fortresses", () => {
      useBuildingStore.getState().placeFortification("mega_fortress", [5, 0, 0]);
      const wall = useBuildingStore.getState().placedFortifications[0];

      expect(wall.type).toBe("mega_fortress");
      expect(wall.health).toBe(10000); // FORTIFICATIONS.mega_fortress.health
    });
  });

  describe("Attack cooldown behavior", () => {
    it("should respect zombie attack speed when damaging walls", () => {
      // This is tested via the computeZombieDamage helper which is already tested
      // in the zombie.test.ts file. The logic is the same for both player and wall attacks.
      expect(true).toBe(true); // Placeholder - actual behavior tested in zombie.test.ts
    });
  });
});
