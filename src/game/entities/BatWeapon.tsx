import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@game/stores/gameStore";
import { useCombatStore } from "@game/stores/combatStore";

const SWING_DURATION = 200; // ms

export function BatWeapon() {
  const groupRef = useRef<THREE.Group>(null!);
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const lastAttackTime = useCombatStore((s) => s.lastAttackTime);
  const prevAttackRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;

    const now = performance.now();
    const timeSinceAttack = now - lastAttackTime;

    // Detect new attack
    if (lastAttackTime !== prevAttackRef.current) {
      prevAttackRef.current = lastAttackTime;
    }

    if (timeSinceAttack < SWING_DURATION) {
      // Swing animation: rotate forward quickly then back
      const t = timeSinceAttack / SWING_DURATION;
      const swing = Math.sin(t * Math.PI) * 1.5;
      groupRef.current.rotation.x = -swing;
    } else {
      // Idle sway
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.z =
        Math.sin(performance.now() * 0.002) * 0.05 - 0.3;
    }
  });

  if (!equippedWeapon) return null;

  const isSpiked = equippedWeapon === "spiked_bat";
  const color = isSpiked ? "#666666" : "#8B7355";
  const length = isSpiked ? 1.2 : 1.0;

  return (
    <group ref={groupRef} position={[0.5, 0.7, 0.3]} rotation={[0, 0, -0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, length, 0.1]} />
        <meshToonMaterial color={color} />
      </mesh>
      {isSpiked && (
        <>
          <mesh position={[0.08, 0.4, 0]} castShadow>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshToonMaterial color="#999999" />
          </mesh>
          <mesh position={[-0.08, 0.35, 0]} castShadow>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshToonMaterial color="#999999" />
          </mesh>
        </>
      )}
    </group>
  );
}
