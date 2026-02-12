import { describe, it, expect, beforeEach } from "vitest";
import { useEconomyStore } from "@game/stores/economyStore";
import { useGameStore } from "@game/stores/gameStore";
import { WEAPONS } from "@shared/constants";

describe("Shop", () => {
  beforeEach(() => {
    useEconomyStore.getState().reset();
    useGameStore.getState().resetGame();
  });

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
});
