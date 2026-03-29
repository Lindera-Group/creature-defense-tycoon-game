import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useBuildingStore } from "@game/stores/buildingStore";
import { useHotbarStore } from "@game/stores/hotbarStore";

const PICKUP_RANGE = 3;

export function HammerSystem() {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  // Subscribe to hammerActive to re-run effect when it changes
  const hammerActive = useHotbarStore((s) => s.hammerActive);

  useEffect(() => {
    if (!hammerActive) return;

    const canvas = gl.domElement;

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!useHotbarStore.getState().hammerActive) return;

      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.current.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      const didHit = raycaster.current.ray.intersectPlane(groundPlane.current, hit);
      if (!didHit) return;

      const { placedTurrets, placedFortifications, removeTurret, removeFortification } =
        useBuildingStore.getState();

      // Check turrets
      for (const t of placedTurrets) {
        const dx = hit.x - t.position[0];
        const dz = hit.z - t.position[2];
        if (dx * dx + dz * dz < PICKUP_RANGE * PICKUP_RANGE) {
          removeTurret(t.id);
          useHotbarStore.getState().addBlueprint(t.type, "turret");
          useHotbarStore.getState().toggleHammer(); // deactivate
          return;
        }
      }

      // Check fortifications
      for (const f of placedFortifications) {
        const dx = hit.x - f.position[0];
        const dz = hit.z - f.position[2];
        if (dx * dx + dz * dz < PICKUP_RANGE * PICKUP_RANGE) {
          removeFortification(f.id);
          useHotbarStore.getState().addBlueprint(f.type, "fortification");
          useHotbarStore.getState().toggleHammer(); // deactivate
          return;
        }
      }
    };

    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [hammerActive, camera, gl]);

  return null;
}
