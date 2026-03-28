import { useRef, useEffect, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBuildingStore } from "@game/stores/buildingStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { isValidPlacement, snapToGrid } from "@game/systems/placementHelpers";
import { getTreePositions } from "@game/world/forestHelpers";
import { TURRETS, FORTIFICATIONS } from "@shared/constants";
import type { TurretType, FortificationType } from "@shared/types";

const GHOST_OPACITY = 0.45;

// ---------------------------------------------------------------------------
// Ghost turret — mirrors Turret.tsx geometry with transparent materials
// ---------------------------------------------------------------------------
const GHOST_TURRET_STYLES: Record<
  TurretType,
  { base: string; barrel: string; barrelScale: [number, number, number] }
> = {
  basic_turret: { base: "#555555", barrel: "#FFD700", barrelScale: [0.25, 1.0, 0.25] },
  laser_turret: { base: "#444444", barrel: "#FF0000", barrelScale: [0.25, 1.0, 0.25] },
  artillery: { base: "#555555", barrel: "#FF6600", barrelScale: [0.35, 1.2, 0.35] },
  silver_turret: { base: "#777777", barrel: "#C0C0C0", barrelScale: [0.25, 1.0, 0.25] },
  holy_cannon: { base: "#DDDDDD", barrel: "#FFFFFF", barrelScale: [0.25, 1.0, 0.25] },
};

function GhostTurret({ type, valid }: { type: TurretType; valid: boolean }) {
  const s = GHOST_TURRET_STYLES[type] || GHOST_TURRET_STYLES.basic_turret;
  const base = valid ? s.base : "#ff4444";
  const barrel = valid ? s.barrel : "#ff4444";

  return (
    <group>
      {/* Base cylinder */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.8, 16]} />
        <meshToonMaterial color={base} transparent opacity={GHOST_OPACITY} />
      </mesh>
      {/* Barrel */}
      <group position={[0, 0.8, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={s.barrelScale} />
          <meshToonMaterial color={barrel} transparent opacity={GHOST_OPACITY} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ghost fortification — mirrors Fortification.tsx geometry per type
// ---------------------------------------------------------------------------
function GhostFortification({ type, valid }: { type: FortificationType; valid: boolean }) {
  const c = (color: string) => (valid ? color : "#ff4444");
  const op = GHOST_OPACITY;

  switch (type) {
    case "wooden_fence":
      return (
        <group>
          {[-0.6, 0, 0.6].map((x) => (
            <mesh key={x} position={[x, 0.75, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
              <meshToonMaterial color={c("#6B4E1F")} transparent opacity={op} />
            </mesh>
          ))}
          {[0.5, 1.0].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[1.4, 0.15, 0.08]} />
              <meshToonMaterial color={c("#8B6914")} transparent opacity={op} />
            </mesh>
          ))}
        </group>
      );

    case "stone_wall":
      return (
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.5, 2.0, 0.5]} />
          <meshToonMaterial color={c("#808080")} transparent opacity={op} />
        </mesh>
      );

    case "watchtower":
      return (
        <group>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.5, 3, 1.5]} />
            <meshToonMaterial color={c("#A0826D")} transparent opacity={op} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <coneGeometry args={[1.2, 1.2, 4]} />
            <meshToonMaterial color={c("#8B4513")} transparent opacity={op} />
          </mesh>
        </group>
      );

    case "fort":
      return (
        <group>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2.5, 3, 2.5]} />
            <meshToonMaterial color={c("#696969")} transparent opacity={op} />
          </mesh>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([bx, bz]) => (
            <mesh key={`${bx}${bz}`} position={[bx, 3.2, bz]}>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshToonMaterial color={c("#555555")} transparent opacity={op} />
            </mesh>
          ))}
        </group>
      );

    case "castle":
      return (
        <group>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[3.5, 5, 3.5]} />
            <meshToonMaterial color={c("#505050")} transparent opacity={op} />
          </mesh>
          {[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map(([tx, tz]) => (
            <group key={`${tx}${tz}`}>
              <mesh position={[tx, 3, tz]}>
                <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
                <meshToonMaterial color={c("#404040")} transparent opacity={op} />
              </mesh>
              <mesh position={[tx, 6.5, tz]}>
                <coneGeometry args={[0.7, 1, 8]} />
                <meshToonMaterial color={c("#8B0000")} transparent opacity={op} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "mega_fortress":
      return (
        <group>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[5, 8, 5]} />
            <meshToonMaterial color={c("#303030")} transparent opacity={op} />
          </mesh>
          {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([bx, bz]) => (
            <mesh key={`${bx}${bz}`} position={[bx, 2.5, bz]}>
              <boxGeometry args={[2, 5, 2]} />
              <meshToonMaterial color={c("#404040")} transparent opacity={op} />
            </mesh>
          ))}
          {/* Connecting walls */}
          <mesh position={[-3, 2, 0]}>
            <boxGeometry args={[0.5, 4, 5]} />
            <meshToonMaterial color={c("#505050")} transparent opacity={op} />
          </mesh>
          <mesh position={[3, 2, 0]}>
            <boxGeometry args={[0.5, 4, 5]} />
            <meshToonMaterial color={c("#505050")} transparent opacity={op} />
          </mesh>
          <mesh position={[0, 2, -3]}>
            <boxGeometry args={[5, 4, 0.5]} />
            <meshToonMaterial color={c("#505050")} transparent opacity={op} />
          </mesh>
          <mesh position={[0, 2, 3]}>
            <boxGeometry args={[5, 4, 0.5]} />
            <meshToonMaterial color={c("#505050")} transparent opacity={op} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// PlacementPreview — main component
// ---------------------------------------------------------------------------
export function PlacementPreview() {
  const { camera, gl } = useThree();
  const previewRef = useRef<THREE.Group>(null!);
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const hitPoint = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const snappedPos = useRef<[number, number, number]>([0, 0, 0]);
  const validRef = useRef(true);
  const rotationRef = useRef(0);
  const [valid, setValid] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const isPlacing = useBuildingStore((s) => s.isPlacing);
  const placingType = useBuildingStore((s) => s.placingType);
  const placingCategory = useBuildingStore((s) => s.placingCategory);
  const cancelPlacing = useBuildingStore((s) => s.cancelPlacing);
  const placeTurret = useBuildingStore((s) => s.placeTurret);
  const placeFortification = useBuildingStore((s) => s.placeFortification);

  // Track mouse in NDC via canvas (not window — correct for embedded canvases)
  useEffect(() => {
    if (!isPlacing) return;
    const canvas = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseNDC.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    canvas.addEventListener("mousemove", onMove);
    return () => canvas.removeEventListener("mousemove", onMove);
  }, [isPlacing, gl]);

  // Keyboard: R rotate, G grid, ESC cancel
  useEffect(() => {
    if (!isPlacing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        rotationRef.current = (rotationRef.current + Math.PI / 2) % (Math.PI * 2);
      }
      if (e.key === "g" || e.key === "G") {
        setShowGrid((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (placingType && placingCategory) {
          const config =
            placingCategory === "turret"
              ? TURRETS[placingType as TurretType]
              : FORTIFICATIONS[placingType as FortificationType];
          if (config) useEconomyStore.getState().addCoins(config.cost);
        }
        cancelPlacing();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlacing, placingType, placingCategory, cancelPlacing]);

  // Click-to-place via DOM event (reliable — bypasses R3F raycasting)
  const handlePlace = useCallback(() => {
    if (!validRef.current || !placingType || !placingCategory) return;
    const [x, , z] = snappedPos.current;
    const rotation = rotationRef.current;

    if (placingCategory === "turret") {
      placeTurret(placingType as TurretType, [x, 0, z], rotation);
    } else {
      placeFortification(placingType as FortificationType, [x, 0, z], rotation);
    }
    cancelPlacing();
    rotationRef.current = 0;
  }, [placingType, placingCategory, placeTurret, placeFortification, cancelPlacing]);

  useEffect(() => {
    if (!isPlacing) return;
    const canvas = gl.domElement;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return; // left-click only
      handlePlace();
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [isPlacing, handlePlace, gl]);

  // Update preview position every frame (60fps, no React re-render)
  useFrame(() => {
    if (!isPlacing || !previewRef.current) return;

    raycaster.current.setFromCamera(mouseNDC.current, camera);
    raycaster.current.ray.intersectPlane(groundPlane.current, hitPoint.current);

    const [sx, sz] = snapToGrid(hitPoint.current.x, hitPoint.current.z);
    snappedPos.current = [sx, 0, sz];
    previewRef.current.position.set(sx, 0, sz);
    previewRef.current.rotation.y = rotationRef.current;

    // Validity check — only trigger re-render when it changes
    const buildings = [
      ...useBuildingStore.getState().placedTurrets.map((t) => ({ position: t.position })),
      ...useBuildingStore.getState().placedFortifications.map((f) => ({ position: f.position })),
    ];
    const trees = getTreePositions().map((t) => [t.x, t.z] as [number, number]);
    const nowValid = isValidPlacement(sx, sz, buildings, trees);
    if (nowValid !== validRef.current) {
      validRef.current = nowValid;
      setValid(nowValid);
    }
  });

  if (!isPlacing || !placingType || !placingCategory) return null;

  const isTurret = placingCategory === "turret";
  const config = isTurret
    ? TURRETS[placingType as TurretType]
    : FORTIFICATIONS[placingType as FortificationType];
  if (!config) return null;

  const range = "range" in config ? config.range : 0;

  return (
    <>
      {showGrid && (
        <gridHelper args={[80, 40, "#ffffff", "#444444"]} position={[0, 0.02, 0]} />
      )}

      <group ref={previewRef}>
        {/* Ghost building — semi-transparent actual geometry */}
        {isTurret ? (
          <GhostTurret type={placingType as TurretType} valid={valid} />
        ) : (
          <GhostFortification type={placingType as FortificationType} valid={valid} />
        )}

        {/* Range indicator for turrets */}
        {isTurret && range > 0 && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[range - 0.2, range, 64]} />
            <meshBasicMaterial
              color={valid ? "#00ff00" : "#ff0000"}
              transparent
              opacity={0.25}
            />
          </mesh>
        )}
      </group>
    </>
  );
}
