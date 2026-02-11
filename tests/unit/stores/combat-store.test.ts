import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCombatStore } from "@game/stores/combatStore";
import { useGameStore } from "@game/stores/gameStore";

describe("CombatStore", () => {
  beforeEach(() => {
    useCombatStore.getState().reset();
    useGameStore.getState().resetGame();
  });

  it("should return 0 damage when no weapon equipped", () => {
    expect(useCombatStore.getState().getWeaponDamage()).toBe(0);
  });

  it("should calculate damage based on equipped weapon", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");
    expect(useCombatStore.getState().getWeaponDamage()).toBe(10);
  });

  it("should get weapon config for equipped weapon", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");
    const config = useCombatStore.getState().getWeaponConfig();
    expect(config).not.toBeNull();
    expect(config!.type).toBe("bat");
    expect(config!.range).toBe(2);
  });

  it("should return null config when no weapon equipped", () => {
    expect(useCombatStore.getState().getWeaponConfig()).toBeNull();
  });

  it("should track attack cooldown based on weapon attack speed", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");

    // First attack should always be allowed
    expect(useCombatStore.getState().canAttack()).toBe(true);

    // After attacking, should be on cooldown
    useCombatStore.getState().performAttack();
    expect(useCombatStore.getState().canAttack()).toBe(false);
  });

  it("should allow attack after cooldown expires", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");

    // bat attackSpeed = 2 (hits/sec) => 500ms cooldown
    useCombatStore.getState().performAttack();

    // Mock time passing
    const now = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(now + 600);

    expect(useCombatStore.getState().canAttack()).toBe(true);

    vi.restoreAllMocks();
  });

  it("should return damage dealt when performing attack", () => {
    useGameStore.getState().addWeapon("bat");
    useGameStore.getState().equipWeapon("bat");
    const damage = useCombatStore.getState().performAttack();
    expect(damage).toBe(10);
  });

  it("should return 0 damage when attacking without weapon", () => {
    const damage = useCombatStore.getState().performAttack();
    expect(damage).toBe(0);
  });

  it("should register a hit on an enemy", () => {
    useCombatStore.getState().registerHit("enemy-1", 10);
    const hits = useCombatStore.getState().recentHits;
    expect(hits).toHaveLength(1);
    expect(hits[0].enemyId).toBe("enemy-1");
    expect(hits[0].damage).toBe(10);
  });

  it("should clear old hits", () => {
    useCombatStore.getState().registerHit("enemy-1", 10);
    useCombatStore.getState().registerHit("enemy-2", 20);
    useCombatStore.getState().clearHits();
    expect(useCombatStore.getState().recentHits).toHaveLength(0);
  });
});
