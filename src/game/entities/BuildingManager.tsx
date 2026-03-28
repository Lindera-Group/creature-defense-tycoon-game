import { useBuildingStore } from "@game/stores/buildingStore";
import { Fortification } from "./Fortification";

/**
 * BuildingManager renders all placed fortifications from the building store.
 * Turrets are rendered separately by TurretSystem since they need AI loops.
 */
export function BuildingManager() {
  const placedFortifications = useBuildingStore((state) => state.placedFortifications);

  return (
    <>
      {placedFortifications.map((fort) => (
        <Fortification
          key={fort.id}
          id={fort.id}
          type={fort.type}
          position={fort.position}
          health={fort.health}
          rotation={fort.rotation}
        />
      ))}
    </>
  );
}
