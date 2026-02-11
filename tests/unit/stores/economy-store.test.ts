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
});
