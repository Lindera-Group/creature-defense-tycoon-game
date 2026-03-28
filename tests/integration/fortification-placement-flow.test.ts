/**
 * Integration test: Fortification purchase and placement flow
 *
 * Tests the cross-store flow for fortifications:
 * Economy (buy) -> Building (place) -> Validation (placement helpers)
 * Also tests damage and destruction interactions with building store.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { isValidPlacement, snapToGrid } from "@game/systems/placementHelpers";
import { FORTIFICATIONS } from "@shared/constants";

describe("Integration: Fortification placement flow", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useEconomyStore.getState().reset();
    useBuildingStore.getState().resetBuildings();
  });

  it("should complete the full buy -> place flow for wooden_fence", () => {
    useEconomyStore.getState().addCoins(200);

    // Buy
    const bought = useEconomyStore.getState().buyFortification("wooden_fence");
    expect(bought).toBe(true);
    expect(useEconomyStore.getState().coins).toBe(135); // 200 - 65

    // Enter placement mode
    useBuildingStore.getState().startPlacing("wooden_fence", "fortification");
    expect(useBuildingStore.getState().isPlacing).toBe(true);

    // Snap position
    const [sx, sz] = snapToGrid(7.8, 6.2);

    // Validate
    expect(isValidPlacement(sx, sz, [], [])).toBe(true);

    // Place
    useBuildingStore.getState().placeFortification("wooden_fence", [sx, 0, sz]);

    // Exit placement
    useBuildingStore.getState().cancelPlacing();

    // Verify
    const forts = useBuildingStore.getState().placedFortifications;
    expect(forts).toHaveLength(1);
    expect(forts[0].type).toBe("wooden_fence");
    expect(forts[0].health).toBe(FORTIFICATIONS.wooden_fence.health);
  });

  it("should allow placing multiple fortifications (no max limit)", () => {
    useEconomyStore.getState().addCoins(10000);

    // Place 15 wooden fences — no limit unlike turrets
    for (let i = 0; i < 15; i++) {
      useEconomyStore.getState().buyFortification("wooden_fence");
      useBuildingStore.getState().placeFortification("wooden_fence", [6 + i * 3, 0, 6]);
    }

    expect(useBuildingStore.getState().placedFortifications).toHaveLength(15);
  });

  it("should track damage across the store and remove destroyed forts", () => {
    useEconomyStore.getState().addCoins(500);
    useEconomyStore.getState().buyFortification("wooden_fence");
    useBuildingStore.getState().placeFortification("wooden_fence", [10, 0, 10]);

    const id = useBuildingStore.getState().placedFortifications[0].id;

    // Simulate zombie attacks (wooden_fence has 100 hp)
    useBuildingStore.getState().damageFortification(id, 40);
    expect(useBuildingStore.getState().placedFortifications[0].health).toBe(60);

    useBuildingStore.getState().damageFortification(id, 40);
    expect(useBuildingStore.getState().placedFortifications[0].health).toBe(20);

    // Final blow destroys it
    useBuildingStore.getState().damageFortification(id, 20);
    expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);
  });

  it("should prevent overlapping turret and fortification placement", () => {
    // Place a turret first
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);

    // Try to place a fort near the turret
    const existingBuildings = [
      ...useBuildingStore.getState().placedTurrets.map((t) => ({ position: t.position })),
      ...useBuildingStore.getState().placedFortifications.map((f) => ({ position: f.position })),
    ];

    // Too close (within 2.5 radius)
    expect(isValidPlacement(11, 11, existingBuildings, [])).toBe(false);

    // Far enough
    expect(isValidPlacement(15, 15, existingBuildings, [])).toBe(true);
  });

  it("should respect phase locking for fortifications", () => {
    useEconomyStore.getState().addCoins(50000);

    // castle requires phase 1, mega_fortress requires phase 2
    expect(useEconomyStore.getState().buyFortification("castle")).toBe(false);
    expect(useEconomyStore.getState().buyFortification("mega_fortress")).toBe(false);

    // Phase 0 fortifications should work
    expect(useEconomyStore.getState().buyFortification("wooden_fence")).toBe(true);
    expect(useEconomyStore.getState().buyFortification("stone_wall")).toBe(true);
  });

  it("should place stone_wall with higher health than wooden_fence", () => {
    useEconomyStore.getState().addCoins(1000);

    useEconomyStore.getState().buyFortification("wooden_fence");
    useBuildingStore.getState().placeFortification("wooden_fence", [10, 0, 10]);

    useEconomyStore.getState().buyFortification("stone_wall");
    useBuildingStore.getState().placeFortification("stone_wall", [15, 0, 15]);

    const forts = useBuildingStore.getState().placedFortifications;
    expect(forts[0].health).toBe(100); // wooden_fence
    expect(forts[1].health).toBe(500); // stone_wall
    expect(forts[1].health).toBeGreaterThan(forts[0].health);
  });
});
