import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Canvas } from "@react-three/fiber";
import { BuildingManager } from "@game/entities/BuildingManager";
import { useBuildingStore } from "@game/stores/buildingStore";

describe("BuildingManager", () => {
  beforeEach(() => {
    useBuildingStore.getState().resetBuildings();
  });

  it("should render nothing when no fortifications are placed", () => {
    const { container } = render(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render fortifications from building store", () => {
    // Place a couple fortifications
    useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);
    useBuildingStore.getState().placeFortification("stone_wall", [5, 0, 0]);

    const { container } = render(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(container.querySelector("canvas")).toBeTruthy();
    const forts = useBuildingStore.getState().placedFortifications;
    expect(forts).toHaveLength(2);
    expect(forts[0].type).toBe("wooden_fence");
    expect(forts[1].type).toBe("stone_wall");
  });

  it("should update when fortifications are added", () => {
    const { container, rerender } = render(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);

    // Add a fortification
    useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);

    rerender(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(container.querySelector("canvas")).toBeTruthy();
    expect(useBuildingStore.getState().placedFortifications).toHaveLength(1);
  });

  it("should update when fortifications are removed", () => {
    // Place a fortification
    useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);
    const fortId = useBuildingStore.getState().placedFortifications[0].id;

    const { container, rerender } = render(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(useBuildingStore.getState().placedFortifications).toHaveLength(1);

    // Remove it
    useBuildingStore.getState().removeFortification(fortId);

    rerender(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(container.querySelector("canvas")).toBeTruthy();
    expect(useBuildingStore.getState().placedFortifications).toHaveLength(0);
  });

  it("should render fortifications with correct health from store", () => {
    useBuildingStore.getState().placeFortification("wooden_fence", [0, 0, 0]);
    const fort = useBuildingStore.getState().placedFortifications[0];

    const { container } = render(
      <Canvas>
        <BuildingManager />
      </Canvas>,
    );

    expect(container.querySelector("canvas")).toBeTruthy();
    expect(fort.health).toBe(100); // FORTIFICATIONS.wooden_fence.health
  });
});
