/**
 * Integration test: Game reset clears all buildings
 *
 * Validates that when the game resets (game over or victory),
 * all stores are properly cleaned up — specifically that buildings
 * placed during a session don't persist into the next game.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useCombatStore } from "@game/stores/combatStore";
import { useBuildingStore } from "@game/stores/buildingStore";

function resetAllStores() {
  useGameStore.getState().resetGame();
  useEconomyStore.getState().reset();
  useCombatStore.getState().reset();
  useBuildingStore.getState().resetBuildings();
}

describe("Integration: Game reset clears buildings", () => {
  beforeEach(() => {
    resetAllStores();
  });

  it("should clear turrets and fortifications on full game reset", () => {
    // Place buildings during gameplay
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    useBuildingStore.getState().placeTurret("laser_turret", [15, 0, 15]);
    useBuildingStore.getState().placeFortification("wooden_fence", [5, 0, 5]);
    useBuildingStore.getState().placeFortification("stone_wall", [8, 0, 8]);

    expect(useBuildingStore.getState().placedTurrets).toHaveLength(2);
    expect(useBuildingStore.getState().placedFortifications).toHaveLength(2);

    // Simulate the full reset flow (same as GameOverScreen/VictoryScreen handlers)
    resetAllStores();

    expect(useBuildingStore.getState().placedTurrets).toEqual([]);
    expect(useBuildingStore.getState().placedFortifications).toEqual([]);
  });

  it("should clear placement mode on reset", () => {
    useBuildingStore.getState().startPlacing("basic_turret", "turret");
    expect(useBuildingStore.getState().isPlacing).toBe(true);

    resetAllStores();

    expect(useBuildingStore.getState().isPlacing).toBe(false);
    expect(useBuildingStore.getState().placingType).toBeNull();
    expect(useBuildingStore.getState().placingCategory).toBeNull();
  });

  it("should reset economy along with buildings", () => {
    useEconomyStore.getState().addCoins(5000);
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);

    resetAllStores();

    expect(useEconomyStore.getState().coins).toBe(0);
    expect(useBuildingStore.getState().placedTurrets).toEqual([]);
  });

  it("should reset game state (wave, health) along with buildings", () => {
    // Simulate some gameplay
    useGameStore.getState().startGame();
    useGameStore.getState().nextWave();
    useGameStore.getState().takeDamage(30);
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);

    expect(useGameStore.getState().wave).toBe(2);
    expect(useGameStore.getState().playerHealth).toBe(70);

    resetAllStores();

    expect(useGameStore.getState().wave).toBe(0);
    expect(useGameStore.getState().playerHealth).toBe(100);
    expect(useGameStore.getState().gameStarted).toBe(false);
    expect(useBuildingStore.getState().placedTurrets).toEqual([]);
  });

  it("should allow placing new buildings after reset with fresh IDs", () => {
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    const oldId = useBuildingStore.getState().placedTurrets[0].id;

    resetAllStores();

    useBuildingStore.getState().placeTurret("basic_turret", [20, 0, 20]);
    const newId = useBuildingStore.getState().placedTurrets[0].id;

    // After reset, IDs restart from 0
    expect(useBuildingStore.getState().placedTurrets).toHaveLength(1);
    expect(newId).toBe(oldId); // Both should be turret_0 after reset
  });

  it("should clear damaged fortifications on reset", () => {
    useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 5]);
    const id = useBuildingStore.getState().placedFortifications[0].id;

    // Damage but don't destroy
    useBuildingStore.getState().damageFortification(id, 200);
    expect(useBuildingStore.getState().placedFortifications[0].health).toBe(300);

    resetAllStores();

    expect(useBuildingStore.getState().placedFortifications).toEqual([]);
  });
});
