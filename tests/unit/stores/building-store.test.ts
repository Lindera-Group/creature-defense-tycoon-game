import { describe, it, expect, beforeEach } from "vitest";
import { useBuildingStore } from "@game/stores/buildingStore";

describe("BuildingStore", () => {
  beforeEach(() => {
    useBuildingStore.getState().resetBuildings();
  });

  describe("initialization", () => {
    it("should initialize with empty placed turrets", () => {
      expect(useBuildingStore.getState().placedTurrets).toEqual([]);
    });

    it("should initialize with empty placed fortifications", () => {
      expect(useBuildingStore.getState().placedFortifications).toEqual([]);
    });

    it("should not be in placement mode", () => {
      const state = useBuildingStore.getState();
      expect(state.isPlacing).toBe(false);
      expect(state.placingType).toBeNull();
      expect(state.placingCategory).toBeNull();
    });
  });

  describe("placement mode", () => {
    it("should enter placement mode with startPlacing", () => {
      useBuildingStore.getState().startPlacing("basic_turret", "turret");
      const state = useBuildingStore.getState();
      expect(state.isPlacing).toBe(true);
      expect(state.placingType).toBe("basic_turret");
      expect(state.placingCategory).toBe("turret");
    });

    it("should exit placement mode with cancelPlacing", () => {
      useBuildingStore.getState().startPlacing("basic_turret", "turret");
      useBuildingStore.getState().cancelPlacing();
      const state = useBuildingStore.getState();
      expect(state.isPlacing).toBe(false);
      expect(state.placingType).toBeNull();
      expect(state.placingCategory).toBeNull();
    });

    it("should enter placement mode for fortifications", () => {
      useBuildingStore.getState().startPlacing("wooden_fence", "fortification");
      const state = useBuildingStore.getState();
      expect(state.isPlacing).toBe(true);
      expect(state.placingType).toBe("wooden_fence");
      expect(state.placingCategory).toBe("fortification");
    });
  });

  describe("turret placement", () => {
    it("should place a turret with unique id and full health", () => {
      useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
      const turrets = useBuildingStore.getState().placedTurrets;
      expect(turrets).toHaveLength(1);
      expect(turrets[0].type).toBe("basic_turret");
      expect(turrets[0].position).toEqual([10, 0, 10]);
      expect(turrets[0].id).toMatch(/^turret_/);
      expect(turrets[0].health).toBeGreaterThan(0);
    });

    it("should place multiple turrets with unique ids", () => {
      useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
      useBuildingStore.getState().placeTurret("laser_turret", [-5, 0, 8]);
      const turrets = useBuildingStore.getState().placedTurrets;
      expect(turrets).toHaveLength(2);
      expect(turrets[0].id).not.toBe(turrets[1].id);
    });

    it("should enforce max 10 turrets", () => {
      for (let i = 0; i < 10; i++) {
        useBuildingStore.getState().placeTurret("basic_turret", [i * 3, 0, 0]);
      }
      expect(useBuildingStore.getState().placedTurrets).toHaveLength(10);

      // 11th turret should be rejected
      const result = useBuildingStore.getState().placeTurret("basic_turret", [30, 0, 0]);
      expect(result).toBe(false);
      expect(useBuildingStore.getState().placedTurrets).toHaveLength(10);
    });

    it("should remove a turret by id", () => {
      useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
      const id = useBuildingStore.getState().placedTurrets[0].id;
      useBuildingStore.getState().removeTurret(id);
      expect(useBuildingStore.getState().placedTurrets).toHaveLength(0);
    });

    it("should damage a turret and remove at 0 health", () => {
      useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
      const id = useBuildingStore.getState().placedTurrets[0].id;
      const initialHealth = useBuildingStore.getState().placedTurrets[0].health;

      useBuildingStore.getState().damageTurret(id, 50);
      expect(useBuildingStore.getState().placedTurrets[0].health).toBe(initialHealth - 50);

      // Overkill should remove
      useBuildingStore.getState().damageTurret(id, 99999);
      expect(useBuildingStore.getState().placedTurrets).toHaveLength(0);
    });
  });

  describe("fortification placement", () => {
    it("should place a fortification with unique id and config health", () => {
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 5]);
      const forts = useBuildingStore.getState().placedFortifications;
      expect(forts).toHaveLength(1);
      expect(forts[0].type).toBe("wooden_fence");
      expect(forts[0].position).toEqual([5, 0, 5]);
      expect(forts[0].id).toMatch(/^fort_/);
      expect(forts[0].health).toBe(100); // wooden_fence health from config
    });

    it("should place stone wall with correct health", () => {
      useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 5]);
      const forts = useBuildingStore.getState().placedFortifications;
      expect(forts[0].health).toBe(500); // stone_wall health from config
    });

    it("should remove a fortification by id", () => {
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 5]);
      const id = useBuildingStore.getState().placedFortifications[0].id;
      useBuildingStore.getState().removeFortification(id);
      expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);
    });

    it("should damage a fortification and remove at 0 health", () => {
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 5]);
      const id = useBuildingStore.getState().placedFortifications[0].id;

      useBuildingStore.getState().damageFortification(id, 60);
      expect(useBuildingStore.getState().placedFortifications[0].health).toBe(40);

      useBuildingStore.getState().damageFortification(id, 50);
      expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);
    });
  });

  describe("reset", () => {
    it("should clear all buildings on reset", () => {
      useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
      useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 5]);
      useBuildingStore.getState().startPlacing("laser_turret", "turret");

      useBuildingStore.getState().resetBuildings();

      const state = useBuildingStore.getState();
      expect(state.placedTurrets).toEqual([]);
      expect(state.placedFortifications).toEqual([]);
      expect(state.isPlacing).toBe(false);
      expect(state.placingType).toBeNull();
    });
  });
});
