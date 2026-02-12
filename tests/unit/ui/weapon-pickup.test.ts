import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";

describe("Weapon Pickup", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("pickup gives bat, equips it, and starts game", () => {
    const store = useGameStore.getState();
    expect(store.ownedWeapons).toHaveLength(0);
    expect(store.equippedWeapon).toBeNull();
    expect(store.gameStarted).toBe(false);

    // Simulate pickup action
    store.addWeapon("bat");
    store.equipWeapon("bat");
    store.startGame();

    const after = useGameStore.getState();
    expect(after.ownedWeapons).toContain("bat");
    expect(after.equippedWeapon).toBe("bat");
    expect(after.gameStarted).toBe(true);
    expect(after.wave).toBe(1);
  });

  it("should show pickup when no weapon owned", () => {
    const { ownedWeapons, gameStarted } = useGameStore.getState();
    const shouldShow = ownedWeapons.length === 0 && !gameStarted;
    expect(shouldShow).toBe(true);
  });

  it("should hide pickup after weapon obtained", () => {
    const store = useGameStore.getState();
    store.addWeapon("bat");
    store.equipWeapon("bat");
    store.startGame();

    const { ownedWeapons, gameStarted } = useGameStore.getState();
    const shouldShow = ownedWeapons.length === 0 && !gameStarted;
    expect(shouldShow).toBe(false);
  });
});
