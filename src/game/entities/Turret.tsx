import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TurretType } from "@shared/types";
import { Html } from "@react-three/drei";

interface TurretProps {
  id: string;
  type: TurretType;
  position: [number, number, number];
  health: number;
  maxHealth?: number;
  targetPos?: [number, number, number] | null;
  rotation?: number;
}

const TURRET_STYLES: Record<
  TurretType,
  { baseColor: string; barrelColor: string; barrelScale: [number, number, number]; emissive?: string }
> = {
  basic_turret: {
    baseColor: "#555555",
    barrelColor: "#FFD700",
    barrelScale: [0.25, 1.0, 0.25],
  },
  laser_turret: {
    baseColor: "#444444",
    barrelColor: "#FF0000",
    barrelScale: [0.25, 1.0, 0.25],
    emissive: "#330000",
  },
  artillery: {
    baseColor: "#555555",
    barrelColor: "#FF6600",
    barrelScale: [0.35, 1.2, 0.35],
  },
  silver_turret: {
    baseColor: "#777777",
    barrelColor: "#C0C0C0",
    barrelScale: [0.25, 1.0, 0.25],
  },
  holy_cannon: {
    baseColor: "#DDDDDD",
    barrelColor: "#FFFFFF",
    barrelScale: [0.25, 1.0, 0.25],
    emissive: "#FFFF99",
  },
};

export function Turret({ type, position, health, maxHealth = 200, targetPos, rotation = 0 }: TurretProps) {
  const barrelRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  const style = useMemo(() => TURRET_STYLES[type] || TURRET_STYLES.basic_turret, [type]);

  // Update barrel rotation toward target (smooth lerp)
  useFrame(() => {
    if (!barrelRef.current) return;

    if (targetPos) {
      const dx = targetPos[0] - position[0];
      const dz = targetPos[2] - position[2];
      targetRotation.current = Math.atan2(dx, dz);
    }

    // Smooth rotation lerp (15% per frame)
    const rotDiff = targetRotation.current - currentRotation.current;
    const shortestAngle = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
    currentRotation.current += shortestAngle * 0.15;

    barrelRef.current.rotation.y = currentRotation.current;

    // Fade out muzzle flash
    if (muzzleFlashRef.current && muzzleFlashRef.current.visible) {
      const mat = muzzleFlashRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity *= 0.85;
      if (mat.opacity < 0.05) {
        muzzleFlashRef.current.visible = false;
      }
    }
  });

  const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base - stationary cylinder */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.8, 16]} />
        <meshToonMaterial color={style.baseColor} />
      </mesh>

      {/* Barrel - rotates toward target */}
      <group ref={barrelRef} position={[0, 0.8, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={style.barrelScale} />
          <meshToonMaterial
            color={style.barrelColor}
            emissive={style.emissive || "#000000"}
            emissiveIntensity={style.emissive ? 0.3 : 0}
          />
        </mesh>

        {/* Muzzle flash */}
        <mesh ref={muzzleFlashRef} position={[0, style.barrelScale[1], 0]} visible={false}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#FFFF00" transparent opacity={1} toneMapped={false} />
        </mesh>
      </group>

      {/* Health bar */}
      <Html position={[0, 1.8, 0]} center distanceFactor={8}>
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            padding: "2px 4px",
            borderRadius: "4px",
            minWidth: "40px",
          }}
        >
          <div
            style={{
              height: "4px",
              background: `linear-gradient(to right, ${
                healthPercent > 0.6 ? "#4CAF50" : healthPercent > 0.3 ? "#FFC107" : "#F44336"
              } ${healthPercent * 100}%, #333 ${healthPercent * 100}%)`,
              borderRadius: "2px",
            }}
          />
        </div>
      </Html>
    </group>
  );
}

/**
 * Trigger muzzle flash animation (called by TurretSystem when turret fires)
 */
export function triggerMuzzleFlash(barrelGroup: THREE.Group | null) {
  if (!barrelGroup) return;
  const muzzleFlash = barrelGroup.children.find(
    (child) => child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial
  ) as THREE.Mesh | undefined;

  if (muzzleFlash) {
    muzzleFlash.visible = true;
    const mat = muzzleFlash.material as THREE.MeshBasicMaterial;
    mat.opacity = 1;
  }
}
