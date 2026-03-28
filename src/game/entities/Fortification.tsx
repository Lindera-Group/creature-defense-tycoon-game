import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { FortificationType } from "@shared/types";
import { FORTIFICATIONS } from "@shared/constants";

interface FortificationProps {
  id: string;
  type: FortificationType;
  position: [number, number, number];
  health: number;
  rotation?: number;
}

export function Fortification({ type, position, health, rotation: _rotation = 0 }: FortificationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const flashRef = useRef(0);
  const healthBarGroupRef = useRef<THREE.Group>(null!);
  const healthFillRef = useRef<THREE.Mesh>(null!);

  const config = FORTIFICATIONS[type];
  const maxHealth = config.health;

  // Material refs for flash effect
  const primaryMatRef = useRef<THREE.MeshToonMaterial>(null!);
  const secondaryMatRef = useRef<THREE.MeshToonMaterial>(null!);
  const tertiaryMatRef = useRef<THREE.MeshToonMaterial>(null!);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Flash effect decay
    if (flashRef.current > 0) {
      flashRef.current -= delta * 5;
      const flash = Math.max(0, flashRef.current);
      if (primaryMatRef.current) {
        primaryMatRef.current.emissive.setRGB(flash, flash, flash);
      }
      if (secondaryMatRef.current) {
        secondaryMatRef.current.emissive.setRGB(flash, flash, flash);
      }
      if (tertiaryMatRef.current) {
        tertiaryMatRef.current.emissive.setRGB(flash, flash, flash);
      }
    }

    // Update health bar: scale fill and billboard toward camera
    if (healthBarGroupRef.current) {
      const cam = state.camera;
      healthBarGroupRef.current.lookAt(cam.position);
    }
    if (healthFillRef.current) {
      const pct = Math.max(0, health / maxHealth);
      healthFillRef.current.scale.x = pct;
      healthFillRef.current.position.x = -(1 - pct) * 0.5;

      // Color health bar based on percentage
      const mat = healthFillRef.current.material as THREE.MeshBasicMaterial;
      if (pct > 0.6) {
        mat.color.setHex(0x4caf50); // Green
      } else if (pct > 0.3) {
        mat.color.setHex(0xffeb3b); // Yellow
      } else {
        mat.color.setHex(0xf44336); // Red
      }
    }
  });

  // Trigger flash on damage (health decreases)
  const prevHealthRef = useRef(health);
  if (health < prevHealthRef.current) {
    flashRef.current = 1;
  }
  prevHealthRef.current = health;

  // Procedural geometry based on type
  const model = useMemo(() => {
    switch (type) {
      case "wooden_fence":
        return (
          <>
            {/* 3 vertical posts */}
            <mesh position={[-0.6, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
              <meshToonMaterial ref={primaryMatRef} color="#6B4E1F" />
            </mesh>
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
              <meshToonMaterial ref={secondaryMatRef} color="#6B4E1F" />
            </mesh>
            <mesh position={[0.6, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
              <meshToonMaterial color="#6B4E1F" />
            </mesh>
            {/* 2 horizontal planks */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1.4, 0.15, 0.08]} />
              <meshToonMaterial ref={tertiaryMatRef} color="#8B6914" />
            </mesh>
            <mesh position={[0, 1.0, 0]} castShadow>
              <boxGeometry args={[1.4, 0.15, 0.08]} />
              <meshToonMaterial color="#8B6914" />
            </mesh>
          </>
        );

      case "stone_wall":
        return (
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[1.5, 2.0, 0.5]} />
            <meshToonMaterial ref={primaryMatRef} color="#808080" />
          </mesh>
        );

      case "watchtower":
        return (
          <>
            {/* Base tower */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[1.5, 3, 1.5]} />
              <meshToonMaterial ref={primaryMatRef} color="#A0826D" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <coneGeometry args={[1.2, 1.2, 4]} />
              <meshToonMaterial ref={secondaryMatRef} color="#8B4513" />
            </mesh>
          </>
        );

      case "fort":
        return (
          <>
            {/* Main structure */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[2.5, 3, 2.5]} />
              <meshToonMaterial ref={primaryMatRef} color="#696969" />
            </mesh>
            {/* Battlements (4 corners) */}
            <mesh position={[-1, 3.2, -1]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshToonMaterial ref={secondaryMatRef} color="#555555" />
            </mesh>
            <mesh position={[1, 3.2, -1]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshToonMaterial color="#555555" />
            </mesh>
            <mesh position={[-1, 3.2, 1]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshToonMaterial color="#555555" />
            </mesh>
            <mesh position={[1, 3.2, 1]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshToonMaterial color="#555555" />
            </mesh>
          </>
        );

      case "castle":
        return (
          <>
            {/* Central keep */}
            <mesh position={[0, 2.5, 0]} castShadow>
              <boxGeometry args={[3.5, 5, 3.5]} />
              <meshToonMaterial ref={primaryMatRef} color="#505050" />
            </mesh>
            {/* 4 corner towers */}
            <mesh position={[-1.8, 3, -1.8]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
              <meshToonMaterial ref={secondaryMatRef} color="#404040" />
            </mesh>
            <mesh position={[1.8, 3, -1.8]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            <mesh position={[-1.8, 3, 1.8]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            <mesh position={[1.8, 3, 1.8]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            {/* Roof cones on towers */}
            <mesh position={[-1.8, 6.5, -1.8]} castShadow>
              <coneGeometry args={[0.7, 1, 8]} />
              <meshToonMaterial ref={tertiaryMatRef} color="#8B0000" />
            </mesh>
            <mesh position={[1.8, 6.5, -1.8]} castShadow>
              <coneGeometry args={[0.7, 1, 8]} />
              <meshToonMaterial color="#8B0000" />
            </mesh>
            <mesh position={[-1.8, 6.5, 1.8]} castShadow>
              <coneGeometry args={[0.7, 1, 8]} />
              <meshToonMaterial color="#8B0000" />
            </mesh>
            <mesh position={[1.8, 6.5, 1.8]} castShadow>
              <coneGeometry args={[0.7, 1, 8]} />
              <meshToonMaterial color="#8B0000" />
            </mesh>
          </>
        );

      case "mega_fortress":
        return (
          <>
            {/* Massive central tower */}
            <mesh position={[0, 4, 0]} castShadow>
              <boxGeometry args={[5, 8, 5]} />
              <meshToonMaterial ref={primaryMatRef} color="#303030" />
            </mesh>
            {/* 4 large corner bastions */}
            <mesh position={[-3, 2.5, -3]} castShadow>
              <boxGeometry args={[2, 5, 2]} />
              <meshToonMaterial ref={secondaryMatRef} color="#404040" />
            </mesh>
            <mesh position={[3, 2.5, -3]} castShadow>
              <boxGeometry args={[2, 5, 2]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            <mesh position={[-3, 2.5, 3]} castShadow>
              <boxGeometry args={[2, 5, 2]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            <mesh position={[3, 2.5, 3]} castShadow>
              <boxGeometry args={[2, 5, 2]} />
              <meshToonMaterial color="#404040" />
            </mesh>
            {/* Connecting walls */}
            <mesh position={[-3, 2, 0]} castShadow>
              <boxGeometry args={[0.5, 4, 5]} />
              <meshToonMaterial ref={tertiaryMatRef} color="#505050" />
            </mesh>
            <mesh position={[3, 2, 0]} castShadow>
              <boxGeometry args={[0.5, 4, 5]} />
              <meshToonMaterial color="#505050" />
            </mesh>
            <mesh position={[0, 2, -3]} castShadow>
              <boxGeometry args={[5, 4, 0.5]} />
              <meshToonMaterial color="#505050" />
            </mesh>
            <mesh position={[0, 2, 3]} castShadow>
              <boxGeometry args={[5, 4, 0.5]} />
              <meshToonMaterial color="#505050" />
            </mesh>
          </>
        );

      default:
        return null;
    }
  }, [type]);

  const healthBarHeight = (() => {
    switch (type) {
      case "wooden_fence":
        return 2.0;
      case "stone_wall":
        return 2.5;
      case "watchtower":
        return 4.5;
      case "fort":
        return 4.0;
      case "castle":
        return 7.5;
      case "mega_fortress":
        return 9.0;
      default:
        return 2.0;
    }
  })();

  return (
    <group ref={groupRef} position={position} rotation={[0, _rotation, 0]}>
      {model}

      {/* Health bar (billboard) */}
      <group ref={healthBarGroupRef} position={[0, healthBarHeight, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[1.5, 0.15]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        {/* Health fill */}
        <mesh ref={healthFillRef} position={[0, 0, 0.001]}>
          <planeGeometry args={[1.5, 0.15]} />
          <meshBasicMaterial color="#4CAF50" />
        </mesh>
      </group>
    </group>
  );
}
