import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";

describe("GameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("should initialize with default state", () => {
    const state = useGameStore.getState();
    expect(state.coins).toBe(0);
    expect(state.playerHealth).toBe(100);
    expect(state.playerMaxHealth).toBe(100);
    expect(state.wave).toBe(0);
    expect(state.equippedWeapon).toBeNull();
    expect(state.ownedWeapons).toEqual([]);
    expect(state.gameStarted).toBe(false);
    expect(state.gameOver).toBe(false);
    expect(state.gamePaused).toBe(false);
    expect(state.phase).toBe(0);
    expect(state.enemiesAlive).toBe(0);
  });

  it("should start the game", () => {
    useGameStore.getState().startGame();
    const state = useGameStore.getState();
    expect(state.gameStarted).toBe(true);
    expect(state.wave).toBe(1);
  });

  it("should add a weapon to owned weapons", () => {
    useGameStore.getState().addWeapon("bat");
    expect(useGameStore.getState().ownedWeapons).toContain("bat");
  });

  it("should not add duplicate weapons", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().addWeapon("bat");
    expect(useGameStore.getState().ownedWeapons).toEqual(["bat"]);
  });

  it("should equip a weapon from owned weapons", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");
    expect(useGameStore.getState().equippedWeapon).toBe("bat");
  });

  it("should not equip a weapon not owned", () => {
    useGameStore.getState().equipWeapon("spiked_bat");
    expect(useGameStore.getState().equippedWeapon).toBeNull();
  });

  it("should take damage and reduce health", () => {
    useGameStore.getState().takeDamage(10);
    expect(useGameStore.getState().playerHealth).toBe(90);
  });

  it("should not reduce health below 0", () => {
    useGameStore.getState().takeDamage(200);
    expect(useGameStore.getState().playerHealth).toBe(0);
  });

  it("should set gameOver when health reaches 0", () => {
    useGameStore.getState().takeDamage(200);
    expect(useGameStore.getState().gameOver).toBe(true);
  });

  it("should advance to next wave", () => {
    useGameStore.getState().startGame();
    useGameStore.getState().nextWave();
    expect(useGameStore.getState().wave).toBe(2);
  });

  it("should track enemies alive count", () => {
    useGameStore.getState().setEnemiesAlive(5);
    expect(useGameStore.getState().enemiesAlive).toBe(5);
  });

  it("should reset game to initial state", () => {
    useGameStore.getState().startGame();
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().takeDamage(30);
    useGameStore.getState().resetGame();
    const state = useGameStore.getState();
    expect(state.gameStarted).toBe(false);
    expect(state.playerHealth).toBe(100);
    expect(state.ownedWeapons).toEqual([]);
    expect(state.wave).toBe(0);
  });
});
