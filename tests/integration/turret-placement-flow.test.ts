/**
 * Integration test: Turret purchase and placement flow
 *
 * Tests the full cross-store flow:
 * Economy (buy) -> Building (place) -> Validation (placement helpers)
 *
 * This ensures the stores work together correctly when a player
 * buys a turret from the shop and places it on the map.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { isValidPlacement, snapToGrid } from "@game/systems/placementHelpers";
import { TURRETS } from "@shared/constants";

describe("Integration: Turret placement flow", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useEconomyStore.getState().reset();
    useBuildingStore.getState().resetBuildings();
  });

  it("should complete the full buy -> place flow for basic_turret", () => {
    // Give player enough coins
    useEconomyStore.getState().addCoins(1000);

    // Step 1: Buy turret (deducts coins)
    const bought = useEconomyStore.getState().buyTurret("basic_turret");
    expect(bought).toBe(true);
    expect(useEconomyStore.getState().coins).toBe(350); // 1000 - 650

    // Step 2: Enter placement mode
    useBuildingStore.getState().startPlacing("basic_turret", "turret");
    expect(useBuildingStore.getState().isPlacing).toBe(true);

    // Step 3: Validate position
    const [snappedX, snappedZ] = snapToGrid(10.3, 10.7);
    expect(snappedX).toBe(10);
    expect(snappedZ).toBe(10);

    const valid = isValidPlacement(snappedX, snappedZ, [], []);
    expect(valid).toBe(true);

    // Step 4: Place turret
    const placed = useBuildingStore.getState().placeTurret("basic_turret", [snappedX, 0, snappedZ]);
    expect(placed).toBe(true);

    // Step 5: Exit placement mode
    useBuildingStore.getState().cancelPlacing();
    expect(useBuildingStore.getState().isPlacing).toBe(false);

    // Verify final state
    const turrets = useBuildingStore.getState().placedTurrets;
    expect(turrets).toHaveLength(1);
    expect(turrets[0].type).toBe("basic_turret");
    expect(turrets[0].position).toEqual([10, 0, 10]);
    expect(useEconomyStore.getState().coins).toBe(350);
  });

  it("should prevent buying when coins are insufficient", () => {
    useEconomyStore.getState().addCoins(100); // Not enough for basic_turret (650)

    const bought = useEconomyStore.getState().buyTurret("basic_turret");
    expect(bought).toBe(false);
    expect(useEconomyStore.getState().coins).toBe(100); // Unchanged
  });

  it("should prevent placing in invalid locations", () => {
    useEconomyStore.getState().addCoins(1000);
    useEconomyStore.getState().buyTurret("basic_turret");

    // Too close to origin
    expect(isValidPlacement(1, 1, [], [])).toBe(false);

    // Out of circular bounds (distance ~84.9 > 75)
    expect(isValidPlacement(60, 60, [], [])).toBe(false);

    // Overlapping a tree
    expect(isValidPlacement(10, 10, [], [[10, 10]])).toBe(false);
  });

  it("should prevent placing near existing buildings", () => {
    // Place first turret
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);

    const existingBuildings = useBuildingStore.getState().placedTurrets.map((t) => ({
      position: t.position,
    }));

    // Try to place right next to it (within 2.5 collision radius)
    expect(isValidPlacement(11, 11, existingBuildings, [])).toBe(false);

    // Far enough away should work
    expect(isValidPlacement(15, 15, existingBuildings, [])).toBe(true);
  });

  it("should enforce max turret limit across multiple purchases", () => {
    useEconomyStore.getState().addCoins(50000);

    // Place 10 turrets (the max)
    for (let i = 0; i < 10; i++) {
      useEconomyStore.getState().buyTurret("basic_turret");
      useBuildingStore.getState().placeTurret("basic_turret", [6 + i * 3, 0, 6]);
    }

    expect(useBuildingStore.getState().placedTurrets).toHaveLength(10);

    // 11th should fail at the building store level
    const placed = useBuildingStore.getState().placeTurret("basic_turret", [40, 0, 0]);
    expect(placed).toBe(false);
  });

  it("should support buying multiple turret types", () => {
    useEconomyStore.getState().addCoins(10000);

    // Buy different types
    expect(useEconomyStore.getState().buyTurret("basic_turret")).toBe(true);
    expect(useEconomyStore.getState().buyTurret("laser_turret")).toBe(true);

    // Place them
    useBuildingStore.getState().placeTurret("basic_turret", [10, 0, 10]);
    useBuildingStore.getState().placeTurret("laser_turret", [15, 0, 15]);

    const turrets = useBuildingStore.getState().placedTurrets;
    expect(turrets).toHaveLength(2);
    expect(turrets[0].type).toBe("basic_turret");
    expect(turrets[1].type).toBe("laser_turret");

    // Verify coins were deducted correctly
    const expectedCoins = 10000 - TURRETS.basic_turret.cost - TURRETS.laser_turret.cost;
    expect(useEconomyStore.getState().coins).toBe(expectedCoins);
  });

  it("should respect phase locking for turrets", () => {
    useEconomyStore.getState().addCoins(50000);

    // silver_turret requires phase 1, holy_cannon requires phase 2
    // Default phase is 0
    expect(useEconomyStore.getState().buyTurret("silver_turret")).toBe(false);
    expect(useEconomyStore.getState().buyTurret("holy_cannon")).toBe(false);

    // Phase 0 turrets should work
    expect(useEconomyStore.getState().buyTurret("basic_turret")).toBe(true);
  });
});
