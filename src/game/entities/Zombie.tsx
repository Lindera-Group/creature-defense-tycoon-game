import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENEMIES } from "@shared/constants";
import { moveTowardPlayer, isInAttackRange, computeZombieDamage, findNearestTarget, resolveCreatureCollision, CREATURE_COLLISION_RADIUS } from "./zombieHelpers";
import type { TargetableEntity } from "./zombieHelpers";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { resolveTreeCollision } from "@game/world/forestHelpers";
import { getHealthBarColor } from "@game/systems/healthBarHelpers";
import type { EnemyType } from "@shared/types";

const ATTACK_RANGE = 1.5;
const RISE_DURATION = 1.2; // seconds to rise from ground

interface ZombieProps {
  id: string;
  enemyType: EnemyType;
  startPosition: [number, number, number];
  playerRef: React.RefObject<THREE.Group | null>;
  onDeath: (id: string, position: [number, number, number], enemyType: string) => void;
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
  enemyType,
  startPosition,
  playerRef,
  onDeath,
  onDamagePlayer,
}: ZombieProps) {
  const config = ENEMIES[enemyType];
  const scale = config.scale;
  const isBoss = enemyType === "zombie_boss";
  const isGiant = enemyType === "zombie_giant";
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
  const pivotRef = useRef<THREE.Group>(null!);
  const riseProgressRef = useRef(0);

  // Wire boss health to store on mount/unmount
  useEffect(() => {
    if (isBoss) {
      useGameStore.getState().setBossHealth(config.health, config.health);
      return () => {
        useGameStore.getState().clearBoss();
      };
    }
  }, [isBoss, config.health]);

  useFrame((_, delta) => {
    if (!groupRef.current || !playerRef.current || deadRef.current) return;

    // Rise-from-ground animation (pivot at toes, rotate forward)
    if (riseProgressRef.current < 1) {
      riseProgressRef.current = Math.min(1, riseProgressRef.current + delta / RISE_DURATION);
      if (pivotRef.current) {
        const t = riseProgressRef.current;
        const eased = 1 - (1 - t) * (1 - t); // quadratic ease-out
        pivotRef.current.rotation.x = (-Math.PI / 2) * (1 - eased);
      }
      return; // don't move or attack while rising
    }

    const playerPos = playerRef.current.position;
    const zombiePos = groupRef.current.position;

    // Build list of all alive targets: player + turrets + fortifications
    const { placedTurrets, placedFortifications } = useBuildingStore.getState();
    const targets: TargetableEntity[] = [
      { type: "player", id: "player", x: playerPos.x, z: playerPos.z },
      ...placedTurrets.filter((t) => t.health > 0).map((t) => ({
        type: "turret" as const,
        id: t.id,
        x: t.position[0],
        z: t.position[2],
      })),
      ...placedFortifications.filter((f) => f.health > 0).map((f) => ({
        type: "fortification" as const,
        id: f.id,
        x: f.position[0],
        z: f.position[2],
      })),
    ];

    const nearestTarget = findNearestTarget(
      { x: zombiePos.x, z: zombiePos.z },
      targets,
    );

    // Fallback to player if no targets found (shouldn't happen but be safe)
    const targetPos = nearestTarget
      ? { x: nearestTarget.x, z: nearestTarget.z }
      : { x: playerPos.x, z: playerPos.z };

    // Move toward nearest target
    const result = moveTowardPlayer(
      { x: zombiePos.x, z: zombiePos.z },
      targetPos,
      config.speed,
      delta,
      ATTACK_RANGE,
    );

    zombiePos.x = result.x;
    zombiePos.z = result.z;
    groupRef.current.rotation.y = result.rotation;

    // Tree collision for zombies
    const treeResolved = resolveTreeCollision(zombiePos.x, zombiePos.z, 0.4);
    zombiePos.x = treeResolved.x;
    zombiePos.z = treeResolved.z;

    // Zombie-vs-player collision (push zombie away from player)
    const playerCollision = resolveCreatureCollision(
      { x: zombiePos.x, z: zombiePos.z },
      CREATURE_COLLISION_RADIUS,
      [{ x: playerPos.x, z: playerPos.z }],
      0.3, // player radius
    );
    zombiePos.x = playerCollision.x;
    zombiePos.z = playerCollision.z;

    // Wobble animation while moving
    const moving = !isInAttackRange(
      { x: zombiePos.x, z: zombiePos.z },
      targetPos,
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

    // Attack: check primary target first, then any building in range
    // This ensures zombies attack walls blocking their path even if targeting the player
    const buildingTargets = targets.filter((t) => t.type !== "player");
    const nearestBuildingInRange = findNearestTarget(
      { x: zombiePos.x, z: zombiePos.z },
      buildingTargets.filter((t) =>
        isInAttackRange({ x: zombiePos.x, z: zombiePos.z }, { x: t.x, z: t.z }, ATTACK_RANGE),
      ),
    );

    const inRangeOfTarget = isInAttackRange(
      { x: zombiePos.x, z: zombiePos.z },
      targetPos,
      ATTACK_RANGE,
    );

    // Prefer attacking primary target, fall back to any building in range
    const attackTarget = inRangeOfTarget ? nearestTarget : nearestBuildingInRange;

    if (attackTarget) {
      const now = performance.now();
      const dmg = computeZombieDamage(config.damage, config.attackSpeed, lastAttackRef.current, now);
      if (dmg.attacked) {
        lastAttackRef.current = now;
        if (attackTarget.type === "turret") {
          useBuildingStore.getState().damageTurret(attackTarget.id, dmg.damage);
        } else if (attackTarget.type === "fortification") {
          useBuildingStore.getState().damageFortification(attackTarget.id, dmg.damage);
        } else {
          onDamagePlayer(dmg.damage);
        }
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
      // Update color based on health percentage
      const mat = healthFillRef.current.material as THREE.MeshBasicMaterial;
      mat.color.setHex(getHealthBarColor(pct));
    }
  });

  // Expose damage handler via the ref-based approach
  const takeDamage = (amount: number) => {
    if (deadRef.current) return;
    healthRef.current -= amount;
    flashRef.current = 1;

    // Update boss health bar in store
    if (isBoss) {
      useGameStore.getState().setBossHealth(Math.max(0, healthRef.current), config.health);
    }

    if (healthRef.current <= 0) {
      deadRef.current = true;
      const pos = groupRef.current?.position;
      if (pos) {
        // Dispatch boss defeat event for screen shake
        if (isBoss) {
          window.dispatchEvent(new CustomEvent("boss-defeated"));
        }
        onDeath(id, [pos.x, pos.y, pos.z], enemyType);
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
      scale={scale}
    >
      {/* Pivot at toes for rise animation */}
      <group ref={pivotRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshToonMaterial
          ref={bodyMatRef}
          color={config.color}
          emissive={isBoss ? "#4A0040" : "#000000"}
          emissiveIntensity={isBoss ? 0.3 : 0}
        />
      </mesh>

      {/* Oversized Head (chibi) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.4, 10, 8]} />
        <meshToonMaterial color={config.color} />
      </mesh>

      {/* Red dot eyes (bigger + glowing for boss/giant) */}
      <mesh position={[-0.15, 1.85, 0.35]}>
        <sphereGeometry args={[isBoss || isGiant ? 0.1 : 0.06, 6, 4]} />
        <meshStandardMaterial
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={isBoss || isGiant ? 2 : 0}
        />
      </mesh>
      <mesh position={[0.15, 1.85, 0.35]}>
        <sphereGeometry args={[isBoss || isGiant ? 0.1 : 0.06, 6, 4]} />
        <meshStandardMaterial
          color="#FF0000"
          emissive="#FF0000"
          emissiveIntensity={isBoss || isGiant ? 2 : 0}
        />
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
        <meshToonMaterial color={config.color} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.2, 0.15, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshToonMaterial color={config.color} />
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
      </group>{/* close pivot */}
    </group>
  );
}
