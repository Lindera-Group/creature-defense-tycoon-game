import { describe, it, expect, beforeEach } from "vitest";
import { useEconomyStore } from "@game/stores/economyStore";
import { ENEMIES } from "@shared/constants";

describe("Coin System", () => {
  beforeEach(() => {
    useEconomyStore.getState().reset();
  });

  it("coin drop is within configured range", () => {
    const config = ENEMIES.zombie_green;
    for (let i = 0; i < 50; i++) {
      const amount = useEconomyStore.getState().rollCoinDrop(config.coinDrop);
      expect(amount).toBeGreaterThanOrEqual(config.coinDrop[0]);
      expect(amount).toBeLessThanOrEqual(config.coinDrop[1]);
    }
  });

  it("coins are added to economy store on collect", () => {
    useEconomyStore.getState().addCoins(7);
    expect(useEconomyStore.getState().coins).toBe(7);
  });

  it("multiple coin pickups accumulate", () => {
    useEconomyStore.getState().addCoins(5);
    useEconomyStore.getState().addCoins(10);
    useEconomyStore.getState().addCoins(3);
    expect(useEconomyStore.getState().coins).toBe(18);
  });
});
