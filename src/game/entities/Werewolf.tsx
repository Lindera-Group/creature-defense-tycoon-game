import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENEMIES } from "@shared/constants";
import {
  moveTowardPlayer,
  isInAttackRange,
  computeZombieDamage,
  findNearestTarget,
  resolveCreatureCollision,
  CREATURE_COLLISION_RADIUS,
} from "./zombieHelpers";
import type { TargetableEntity } from "./zombieHelpers";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { resolveTreeCollision } from "@game/world/forestHelpers";
import { getHealthBarColor } from "@game/systems/healthBarHelpers";
import type { EnemyType } from "@shared/types";

const ATTACK_RANGE = 1.5;
const RISE_DURATION = 1.0; // slightly faster rise for agile werewolves

interface WerewolfProps {
  id: string;
  enemyType: EnemyType;
  startPosition: [number, number, number];
  playerRef: React.RefObject<THREE.Group | null>;
  onDeath: (id: string, position: [number, number, number], enemyType: string) => void;
  onDamagePlayer: (damage: number) => void;
  onTakeDamage: (id: string, damage: number) => void;
}

export interface WerewolfHandle {
  id: string;
  getPosition: () => { x: number; z: number };
  getHealth: () => number;
  takeDamage: (amount: number) => void;
}

export function Werewolf({
  id,
  enemyType,
  startPosition,
  playerRef,
  onDeath,
  onDamagePlayer,
}: WerewolfProps) {
  const config = ENEMIES[enemyType];
  const scale = config.scale;
  const isBoss = enemyType === "werewolf_boss";
  const isGiant = enemyType === "werewolf_giant";

  const groupRef = useRef<THREE.Group>(null!);
  const healthRef = useRef(config.health);
  const lastAttackRef = useRef(0);
  const deadRef = useRef(false);
  const flashRef = useRef(0);
  // Werewolf uses front/back legs for loping gait
  const frontLeftLegRef = useRef<THREE.Mesh>(null!);
  const frontRightLegRef = useRef<THREE.Mesh>(null!);
  const backLeftLegRef = useRef<THREE.Mesh>(null!);
  const backRightLegRef = useRef<THREE.Mesh>(null!);
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

    // Rise-from-ground animation
    if (riseProgressRef.current < 1) {
      riseProgressRef.current = Math.min(1, riseProgressRef.current + delta / RISE_DURATION);
      if (pivotRef.current) {
        const t = riseProgressRef.current;
        const eased = 1 - (1 - t) * (1 - t);
        pivotRef.current.rotation.x = (-Math.PI / 2) * (1 - eased);
      }
      return;
    }

    const playerPos = playerRef.current.position;
    const wolfPos = groupRef.current.position;

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

    const nearestTarget = findNearestTarget({ x: wolfPos.x, z: wolfPos.z }, targets);

    const targetPos = nearestTarget
      ? { x: nearestTarget.x, z: nearestTarget.z }
      : { x: playerPos.x, z: playerPos.z };

    // Move toward nearest target
    const result = moveTowardPlayer(
      { x: wolfPos.x, z: wolfPos.z },
      targetPos,
      config.speed,
      delta,
      ATTACK_RANGE,
    );

    wolfPos.x = result.x;
    wolfPos.z = result.z;
    groupRef.current.rotation.y = result.rotation;

    // Tree collision
    const treeResolved = resolveTreeCollision(wolfPos.x, wolfPos.z, 0.4);
    wolfPos.x = treeResolved.x;
    wolfPos.z = treeResolved.z;

    // Werewolf-vs-player collision
    const playerCollision = resolveCreatureCollision(
      { x: wolfPos.x, z: wolfPos.z },
      CREATURE_COLLISION_RADIUS,
      [{ x: playerPos.x, z: playerPos.z }],
      0.3,
    );
    wolfPos.x = playerCollision.x;
    wolfPos.z = playerCollision.z;

    // Loping gait: diagonal pairs move together (faster than zombie)
    const moving = !isInAttackRange(
      { x: wolfPos.x, z: wolfPos.z },
      targetPos,
      ATTACK_RANGE,
    );

    if (moving) {
      const time = performance.now() * 0.012; // faster cadence than zombie
      const bob = Math.sin(time) * 0.35;
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = bob;
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = bob;
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = -bob;
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = -bob;
    } else {
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = 0;
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = 0;
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = 0;
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = 0;
    }

    // Attack logic — same as Zombie
    const buildingTargets = targets.filter((t) => t.type !== "player");
    const nearestBuildingInRange = findNearestTarget(
      { x: wolfPos.x, z: wolfPos.z },
      buildingTargets.filter((t) =>
        isInAttackRange({ x: wolfPos.x, z: wolfPos.z }, { x: t.x, z: t.z }, ATTACK_RANGE),
      ),
    );

    const inRangeOfTarget = isInAttackRange(
      { x: wolfPos.x, z: wolfPos.z },
      targetPos,
      ATTACK_RANGE,
    );

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

    // Health bar billboard
    if (healthBarGroupRef.current) {
      healthBarGroupRef.current.rotation.y = -groupRef.current.rotation.y;
    }
    if (healthFillRef.current) {
      const pct = Math.max(0, healthRef.current / config.health);
      healthFillRef.current.scale.x = pct;
      healthFillRef.current.position.x = -(1 - pct) * 0.5;
      const mat = healthFillRef.current.material as THREE.MeshBasicMaterial;
      mat.color.setHex(getHealthBarColor(pct));
    }
  });

  const takeDamage = (amount: number) => {
    if (deadRef.current) return;
    healthRef.current -= amount;
    flashRef.current = 1;

    if (isBoss) {
      useGameStore.getState().setBossHealth(Math.max(0, healthRef.current), config.health);
    }

    if (healthRef.current <= 0) {
      deadRef.current = true;
      const pos = groupRef.current?.position;
      if (pos) {
        if (isBoss) {
          window.dispatchEvent(new CustomEvent("boss-defeated"));
        }
        onDeath(id, [pos.x, pos.y, pos.z], enemyType);
      }
    }
  };

  const handleRef = useRef({ id, takeDamage, healthRef });
  handleRef.current = { id, takeDamage, healthRef };

  if (deadRef.current) return null;

  // Health bar Y offset: bigger for boss/giant
  const healthBarY = isBoss ? 3.2 : isGiant ? 2.8 : 2.2;

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
        {/* ===== BODY (hunched forward, wider chest) ===== */}
        {/* Lower torso / haunches */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.75, 0.6, 0.55]} />
          <meshToonMaterial
            ref={bodyMatRef}
            color={config.color}
            emissive={isBoss ? "#3A0000" : "#000000"}
            emissiveIntensity={isBoss ? 0.4 : 0}
          />
        </mesh>

        {/* Upper torso (chest) — lean forward */}
        <mesh position={[0, 0.95, 0.2]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.65, 0.5]} />
          <meshToonMaterial color={config.color} />
        </mesh>

        {/* ===== WOLF HEAD (elongated snout) ===== */}
        {/* Skull */}
        <mesh position={[0, 1.45, 0.35]} castShadow>
          <boxGeometry args={[0.55, 0.45, 0.5]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, 1.35, 0.65]} castShadow>
          <boxGeometry args={[0.3, 0.25, 0.35]} />
          <meshToonMaterial color={config.color} />
        </mesh>

        {/* Pointed ears */}
        <mesh position={[-0.22, 1.75, 0.3]} rotation={[0, 0, 0.25]} castShadow>
          <coneGeometry args={[0.1, 0.28, 4]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        <mesh position={[0.22, 1.75, 0.3]} rotation={[0, 0, -0.25]} castShadow>
          <coneGeometry args={[0.1, 0.28, 4]} />
          <meshToonMaterial color={config.color} />
        </mesh>

        {/* Glowing yellow eyes */}
        <mesh position={[-0.16, 1.48, 0.58]}>
          <sphereGeometry args={[isBoss || isGiant ? 0.09 : 0.055, 6, 4]} />
          <meshStandardMaterial
            color="#FFEE00"
            emissive="#FFEE00"
            emissiveIntensity={isBoss || isGiant ? 3 : 1.5}
          />
        </mesh>
        <mesh position={[0.16, 1.48, 0.58]}>
          <sphereGeometry args={[isBoss || isGiant ? 0.09 : 0.055, 6, 4]} />
          <meshStandardMaterial
            color="#FFEE00"
            emissive="#FFEE00"
            emissiveIntensity={isBoss || isGiant ? 3 : 1.5}
          />
        </mesh>

        {/* ===== ARMS with claws ===== */}
        {/* Left arm */}
        <mesh position={[-0.55, 0.95, 0.25]} rotation={[-0.5, 0, 0.15]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Left claw tips */}
        <mesh position={[-0.56, 0.62, 0.45]}>
          <coneGeometry args={[0.05, 0.18, 3]} />
          <meshToonMaterial color="#1A0A0A" />
        </mesh>

        {/* Right arm */}
        <mesh position={[0.55, 0.95, 0.25]} rotation={[-0.5, 0, -0.15]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Right claw tips */}
        <mesh position={[0.56, 0.62, 0.45]}>
          <coneGeometry args={[0.05, 0.18, 3]} />
          <meshToonMaterial color="#1A0A0A" />
        </mesh>

        {/* ===== LEGS ===== */}
        {/* Front left leg */}
        <mesh ref={frontLeftLegRef} position={[-0.22, 0.18, 0.18]} castShadow>
          <boxGeometry args={[0.22, 0.38, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Front right leg */}
        <mesh ref={frontRightLegRef} position={[0.22, 0.18, 0.18]} castShadow>
          <boxGeometry args={[0.22, 0.38, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Back left leg */}
        <mesh ref={backLeftLegRef} position={[-0.22, 0.18, -0.12]} castShadow>
          <boxGeometry args={[0.22, 0.38, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>
        {/* Back right leg */}
        <mesh ref={backRightLegRef} position={[0.22, 0.18, -0.12]} castShadow>
          <boxGeometry args={[0.22, 0.38, 0.22]} />
          <meshToonMaterial color={config.color} />
        </mesh>

        {/* ===== HEALTH BAR ===== */}
        <group ref={healthBarGroupRef} position={[0, healthBarY, 0]}>
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
    </group>
  );
}
