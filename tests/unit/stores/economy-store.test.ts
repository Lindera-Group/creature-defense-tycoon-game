import { describe, it, expect, beforeEach } from "vitest";
import { useEconomyStore } from "@game/stores/economyStore";
import { useGameStore } from "@game/stores/gameStore";

describe("EconomyStore", () => {
  beforeEach(() => {
    useEconomyStore.getState().reset();
    useGameStore.getState().resetGame();
  });

  it("should initialize with 0 coins", () => {
    expect(useEconomyStore.getState().coins).toBe(0);
  });

  it("should add coins", () => {
    useEconomyStore.getState().addCoins(10);
    expect(useEconomyStore.getState().coins).toBe(10);
  });

  it("should accumulate coins", () => {
    useEconomyStore.getState().addCoins(10);
    useEconomyStore.getState().addCoins(25);
    expect(useEconomyStore.getState().coins).toBe(35);
  });

  it("should spend coins when affordable", () => {
    useEconomyStore.getState().addCoins(100);
    const result = useEconomyStore.getState().spendCoins(50);
    expect(result).toBe(true);
    expect(useEconomyStore.getState().coins).toBe(50);
  });

  it("should refuse to spend when insufficient coins", () => {
    useEconomyStore.getState().addCoins(30);
    const result = useEconomyStore.getState().spendCoins(50);
    expect(result).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(30);
  });

  it("should check if player can afford a cost", () => {
    useEconomyStore.getState().addCoins(100);
    expect(useEconomyStore.getState().canAfford(100)).toBe(true);
    expect(useEconomyStore.getState().canAfford(101)).toBe(false);
  });

  it("should roll coin drop within configured range", () => {
    const drop = useEconomyStore.getState().rollCoinDrop([5, 10]);
    expect(drop).toBeGreaterThanOrEqual(5);
    expect(drop).toBeLessThanOrEqual(10);
  });

  it("should handle buying a weapon (deduct coins + add to game store)", () => {
    useEconomyStore.getState().addCoins(100);
    const result = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(result).toBe(true);
    expect(useEconomyStore.getState().coins).toBe(0);
    expect(useGameStore.getState().ownedWeapons).toContain("spiked_bat");
    expect(useGameStore.getState().equippedWeapon).toBe("spiked_bat");
  });

  it("should refuse to buy weapon when insufficient coins", () => {
    useEconomyStore.getState().addCoins(50);
    const result = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(result).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(50);
    expect(useGameStore.getState().ownedWeapons).not.toContain("spiked_bat");
  });

  it("should not buy already owned weapon", () => {
    useEconomyStore.getState().addCoins(200);
    useEconomyStore.getState().buyWeapon("spiked_bat");
    const result = useEconomyStore.getState().buyWeapon("spiked_bat");
    expect(result).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(100);
  });

  // === Coin spawn queue with enemy type (M2) ===

  it("should queue coin spawns with enemy type", () => {
    useEconomyStore.getState().queueCoinSpawn([1, 0, 2], "zombie_green");
    useEconomyStore.getState().queueCoinSpawn([3, 0, 4], "zombie_boss");
    const spawns = useEconomyStore.getState().drainCoinSpawns();
    expect(spawns).toHaveLength(2);
    expect(spawns[0].enemyType).toBe("zombie_green");
    expect(spawns[0].position).toEqual([1, 0, 2]);
    expect(spawns[1].enemyType).toBe("zombie_boss");
  });

  it("should drain coin spawns and clear queue", () => {
    useEconomyStore.getState().queueCoinSpawn([0, 0, 0], "zombie_red");
    const first = useEconomyStore.getState().drainCoinSpawns();
    expect(first).toHaveLength(1);
    const second = useEconomyStore.getState().drainCoinSpawns();
    expect(second).toHaveLength(0);
  });

  it("should return empty array when no pending spawns", () => {
    const spawns = useEconomyStore.getState().drainCoinSpawns();
    expect(spawns).toHaveLength(0);
  });

  it("should clear pending spawns on reset", () => {
    useEconomyStore.getState().queueCoinSpawn([0, 0, 0], "zombie_giant");
    useEconomyStore.getState().reset();
    const spawns = useEconomyStore.getState().drainCoinSpawns();
    expect(spawns).toHaveLength(0);
  });

  // === Turret & Fortification purchases (M3) ===

  describe("buyTurret", () => {
    it("should deduct coins and return true", () => {
      useEconomyStore.getState().addCoins(750);
      const result = useEconomyStore.getState().buyTurret("basic_turret");
      expect(result).toBe(true);
      expect(useEconomyStore.getState().coins).toBe(100);
    });

    it("should refuse when insufficient coins", () => {
      useEconomyStore.getState().addCoins(100);
      const result = useEconomyStore.getState().buyTurret("basic_turret");
      expect(result).toBe(false);
      expect(useEconomyStore.getState().coins).toBe(100);
    });

    it("should allow multiple purchases of same type", () => {
      useEconomyStore.getState().addCoins(1500);
      expect(useEconomyStore.getState().buyTurret("basic_turret")).toBe(true);
      expect(useEconomyStore.getState().buyTurret("basic_turret")).toBe(true);
      expect(useEconomyStore.getState().coins).toBe(200);
    });

    it("should refuse phase-locked turret at wrong phase", () => {
      useEconomyStore.getState().addCoins(10000);
      const result = useEconomyStore.getState().buyTurret("silver_turret");
      expect(result).toBe(false);
      expect(useEconomyStore.getState().coins).toBe(10000);
    });
  });

  describe("buyFortification", () => {
    it("should deduct coins for wooden fence", () => {
      useEconomyStore.getState().addCoins(100);
      const result = useEconomyStore.getState().buyFortification("wooden_fence");
      expect(result).toBe(true);
      expect(useEconomyStore.getState().coins).toBe(35);
    });

    it("should refuse when insufficient coins", () => {
      useEconomyStore.getState().addCoins(10);
      const result = useEconomyStore.getState().buyFortification("wooden_fence");
      expect(result).toBe(false);
      expect(useEconomyStore.getState().coins).toBe(10);
    });

    it("should allow multiple purchases", () => {
      useEconomyStore.getState().addCoins(200);
      expect(useEconomyStore.getState().buyFortification("wooden_fence")).toBe(true);
      expect(useEconomyStore.getState().buyFortification("wooden_fence")).toBe(true);
      expect(useEconomyStore.getState().coins).toBe(70);
    });
  });
});
