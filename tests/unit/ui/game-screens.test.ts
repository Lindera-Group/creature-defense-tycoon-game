import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";

describe("Game Screens", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("game over triggers when health reaches 0", () => {
    useGameStore.getState().takeDamage(100);
    expect(useGameStore.getState().gameOver).toBe(true);
    expect(useGameStore.getState().playerHealth).toBe(0);
  });

  it("reset game restores all defaults", () => {
    useGameStore.getState().startGame();
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().takeDamage(50);
    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.playerHealth).toBe(100);
    expect(state.gameStarted).toBe(false);
    expect(state.gameOver).toBe(false);
    expect(state.wave).toBe(0);
    expect(state.ownedWeapons).toHaveLength(0);
  });

  it("start screen shows before game start", () => {
    const { gameStarted, ownedWeapons } = useGameStore.getState();
    expect(gameStarted).toBe(false);
    expect(ownedWeapons).toHaveLength(0);
  });
});
