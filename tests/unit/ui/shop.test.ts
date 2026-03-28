import { describe, it, expect, beforeEach } from "vitest";
import { useEconomyStore } from "@game/stores/economyStore";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { WEAPONS, TURRETS, FORTIFICATIONS } from "@shared/constants";

describe("Shop", () => {
  beforeEach(() => {
    useEconomyStore.getState().reset();
    useGameStore.getState().resetGame();
    useBuildingStore.getState().resetBuildings();
  });

  // === Weapon purchases ===

  it("spiked_bat costs 100", () => {
    expect(WEAPONS.spiked_bat.cost).toBe(100);
  });

  it("cannot buy when insufficient coins", () => {
    useEconomyStore.getState().addCoins(50);
    const result = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(result).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(50);
  });

  it("can buy when enough coins", () => {
    useEconomyStore.getState().addCoins(100);
    const result = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(result).toBe(true);
    expect(useEconomyStore.getState().coins).toBe(0);
  });

  it("buying auto-equips the weapon", () => {
    useEconomyStore.getState().addCoins(100);
    useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(useGameStore.getState().equippedWeapon).toBe("spiked_bat");
  });

  it("cannot buy already owned weapon", () => {
    useEconomyStore.getState().addCoins(200);
    useEconomyStore.getState().buyWeapon("spiked_bat");
    const secondBuy = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(secondBuy).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(100);
  });

  // === Defense purchases ===

  describe("turret purchases from shop", () => {
    it("basic_turret costs 650", () => {
      expect(TURRETS.basic_turret.cost).toBe(650);
    });

    it("buying turret enters placement mode", () => {
      useEconomyStore.getState().addCoins(700);
      useEconomyStore.getState().buyTurret("basic_turret");
      useBuildingStore.getState().startPlacing("basic_turret", "turret");
      expect(useBuildingStore.getState().isPlacing).toBe(true);
      expect(useBuildingStore.getState().placingType).toBe("basic_turret");
      expect(useBuildingStore.getState().placingCategory).toBe("turret");
    });
  });

  describe("fortification purchases from shop", () => {
    it("wooden_fence costs 65", () => {
      expect(FORTIFICATIONS.wooden_fence.cost).toBe(65);
    });

    it("buying fortification enters placement mode", () => {
      useEconomyStore.getState().addCoins(100);
      useEconomyStore.getState().buyFortification("wooden_fence");
      useBuildingStore.getState().startPlacing("wooden_fence", "fortification");
      expect(useBuildingStore.getState().isPlacing).toBe(true);
      expect(useBuildingStore.getState().placingType).toBe("wooden_fence");
      expect(useBuildingStore.getState().placingCategory).toBe("fortification");
    });
  });

  describe("phase-locked items", () => {
    it("phase 0 should have basic_turret, laser_turret, artillery available", () => {
      const phase0Turrets = Object.entries(TURRETS).filter(
        ([, config]) => config.unlockedAtPhase === 0,
      );
      expect(phase0Turrets.length).toBe(3);
    });

    it("phase 0 should have wooden_fence and stone_wall available", () => {
      const phase0Forts = Object.entries(FORTIFICATIONS).filter(
        ([, config]) => config.unlockedAtPhase === 0,
      );
      expect(phase0Forts.length).toBeGreaterThanOrEqual(2);
    });

    it("silver_turret requires phase 1", () => {
      expect(TURRETS.silver_turret.unlockedAtPhase).toBe(1);
    });

    it("castle requires phase 1", () => {
      expect(FORTIFICATIONS.castle.unlockedAtPhase).toBe(1);
    });
  });
});
