import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENEMIES } from "@shared/constants";
import { moveTowardPlayer, isInAttackRange, computeZombieDamage } from "./zombieHelpers";

const config = ENEMIES.zombie_green;
const ATTACK_RANGE = 1.5;

interface ZombieProps {
  id: string;
  startPosition: [number, number, number];
  playerRef: React.RefObject<THREE.Group | null>;
  onDeath: (id: string, position: [number, number, number]) => void;
  onDamagePlayer: (damage: number) => void;
  onTakeDamage: (id: string, damage: number) => void;
}

export interface ZombieHandle {
  id: string;
  getPosition: () => { x: number; z: number };
  getHealth: () => number;
  takeDamage: (amount: number) => void;
}

export function Zombie({
  id,
  startPosition,
  playerRef,
  onDeath,
  onDamagePlayer,
}: ZombieProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const healthRef = useRef(config.health);
  const lastAttackRef = useRef(0);
  const deadRef = useRef(false);
  const flashRef = useRef(0);
  const leftLegRef = useRef<THREE.Mesh>(null!);
  const rightLegRef = useRef<THREE.Mesh>(null!);
  const bodyMatRef = useRef<THREE.MeshToonMaterial>(null!);
  const healthBarGroupRef = useRef<THREE.Group>(null!);
  const healthFillRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerRef.current || deadRef.current) return;

    const playerPos = playerRef.current.position;
    const zombiePos = groupRef.current.position;

    // Move toward player
    const result = moveTowardPlayer(
      { x: zombiePos.x, z: zombiePos.z },
      { x: playerPos.x, z: playerPos.z },
      config.speed,
      delta,
      ATTACK_RANGE,
    );

    zombiePos.x = result.x;
    zombiePos.z = result.z;
    groupRef.current.rotation.y = result.rotation;

    // Wobble animation while moving
    const moving = !isInAttackRange(
      { x: zombiePos.x, z: zombiePos.z },
      { x: playerPos.x, z: playerPos.z },
      ATTACK_RANGE,
    );

    if (moving) {
      const time = performance.now() * 0.008;
      const bob = Math.sin(time) * 0.2;
      if (leftLegRef.current) leftLegRef.current.rotation.x = bob;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -bob;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }

    // Attack player when in range
    if (
      isInAttackRange(
        { x: zombiePos.x, z: zombiePos.z },
        { x: playerPos.x, z: playerPos.z },
        ATTACK_RANGE,
      )
    ) {
      const now = performance.now();
      const dmg = computeZombieDamage(config.damage, config.attackSpeed, lastAttackRef.current, now);
      if (dmg.attacked) {
        lastAttackRef.current = now;
        onDamagePlayer(dmg.damage);
      }
    }

    // Flash effect decay
    if (flashRef.current > 0) {
      flashRef.current -= delta * 5;
      if (bodyMatRef.current) {
        const flash = Math.max(0, flashRef.current);
        bodyMatRef.current.emissive.setRGB(flash, flash, flash);
      }
    }

    // Update health bar: scale fill and billboard toward camera
    if (healthBarGroupRef.current) {
      // Billboard: counter-rotate against zombie so bar always faces camera
      healthBarGroupRef.current.rotation.y = -groupRef.current.rotation.y;
    }
    if (healthFillRef.current) {
      const pct = Math.max(0, healthRef.current / config.health);
      healthFillRef.current.scale.x = pct;
      healthFillRef.current.position.x = -(1 - pct) * 0.5;
    }
  });

  // Expose damage handler via the ref-based approach
  const takeDamage = (amount: number) => {
    if (deadRef.current) return;
    healthRef.current -= amount;
    flashRef.current = 1;

    if (healthRef.current <= 0) {
      deadRef.current = true;
      const pos = groupRef.current?.position;
      if (pos) {
        onDeath(id, [pos.x, pos.y, pos.z]);
      }
    }
  };

  // Store handle ref for stable reference across renders
  const handleRef = useRef({ id, takeDamage, healthRef });
  handleRef.current = { id, takeDamage, healthRef };

  if (deadRef.current) return null;

  return (
    <group
      ref={(g) => {
        groupRef.current = g!;
        if (g) g.userData.zombieHandle = handleRef.current;
      }}
      position={startPosition}
    >
      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshToonMaterial ref={bodyMatRef} color={config.color} />
      </mesh>

      {/* Oversized Head (chibi) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshToonMaterial color={config.color} />
      </mesh>

      {/* Red dot eyes */}
      <mesh position={[-0.15, 1.85, 0.35]}>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
      <mesh position={[0.15, 1.85, 0.35]}>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>

      {/* Arms extended forward (zombie pose) */}
      <mesh position={[-0.55, 0.9, 0.3]} rotation={[-0.8, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshToonMaterial color={config.color} />
      </mesh>
      <mesh position={[0.55, 0.9, 0.3]} rotation={[-0.8, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshToonMaterial color={config.color} />
      </mesh>

      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.2, 0.15, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshToonMaterial color="#388E3C" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.2, 0.15, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshToonMaterial color="#388E3C" />
      </mesh>

      {/* Health bar (billboard) */}
      <group ref={healthBarGroupRef} position={[0, 2.4, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[1, 0.12]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        {/* Health fill */}
        <mesh ref={healthFillRef} position={[0, 0, 0.001]}>
          <planeGeometry args={[1, 0.12]} />
          <meshBasicMaterial color="#4CAF50" />
        </mesh>
      </group>
    </group>
  );
}
