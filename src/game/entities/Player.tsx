import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardInput } from "@game/hooks/useKeyboardInput";
import { useFollowCamera } from "@game/hooks/useFollowCamera";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import {
  computeMovementVelocity,
  rotateMovementByCamera,
  clampPosition,
  computeRotation,
  resolveBuildingCollision,
  isPastWorldEdge,
  PLAYER_SPEED,
  SPRINT_MULTIPLIER,
} from "./playerHelpers";
import { resolveTreeCollision } from "@game/world/forestHelpers";
import { resolveCreatureCollision, CREATURE_COLLISION_RADIUS } from "./zombieHelpers";
import type { EnemyManagerHandle } from "./EnemyManager";
import { BatWeapon } from "./BatWeapon";

const BODY_COLOR = "#FFD700";
const HEAD_COLOR = "#FFCC80";
const EYE_COLOR = "#111111";
const LIMB_COLOR = "#4488CC";

interface PlayerProps {
  enemyManagerRef?: React.RefObject<EnemyManagerHandle | null>;
}

export const Player = forwardRef<THREE.Group, PlayerProps>(function Player({ enemyManagerRef }, ref) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Mesh>(null!);
  const rightLegRef = useRef<THREE.Mesh>(null!);
  const leftArmRef = useRef<THREE.Mesh>(null!);
  const rightArmRef = useRef<THREE.Mesh>(null!);

  const keys = useKeyboardInput();
  const cameraAzimuth = useFollowCamera(groupRef);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameOver = useGameStore((s) => s.gameOver);

  // Expose the group ref
  useImperativeHandle(ref, () => groupRef.current, []);

  const currentRotation = useRef(Math.PI);
  const fallingRef = useRef(false);
  const fallVelocityRef = useRef(0);

  // Reset position on game restart
  useEffect(() => {
    if (!gameStarted && !gameOver && groupRef.current) {
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.set(0, Math.PI, 0);
      currentRotation.current = Math.PI;
      fallingRef.current = false;
      fallVelocityRef.current = 0;
    }
  }, [gameStarted, gameOver]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const pos = groupRef.current.position;

    // Falling off edge — gravity, no horizontal control
    if (fallingRef.current) {
      fallVelocityRef.current += 20 * delta; // gravity
      pos.y -= fallVelocityRef.current * delta;
      // Tilt forward as they fall
      groupRef.current.rotation.x -= delta * 1.5;
      if (pos.y < -15) {
        useGameStore.getState().takeDamage(99999);
      }
      return;
    }

    // Check if past world edge → start falling
    if (isPastWorldEdge(pos.x, pos.z)) {
      fallingRef.current = true;
      fallVelocityRef.current = 0;
      return;
    }

    const rawVelocity = computeMovementVelocity(keys.current);
    const velocity = rotateMovementByCamera(rawVelocity, cameraAzimuth.current);
    const isMoving = velocity.x !== 0 || velocity.z !== 0;

    // Apply movement with tree and building collision
    const speed = PLAYER_SPEED * (keys.current.shift ? SPRINT_MULTIPLIER : 1);
    const newX = pos.x + velocity.x * speed * delta;
    const newZ = pos.z + velocity.z * speed * delta;
    const resolved = resolveTreeCollision(newX, newZ, 0.3);

    // Resolve building collision
    const placedTurrets = useBuildingStore.getState().placedTurrets;
    const placedFortifications = useBuildingStore.getState().placedFortifications;
    const allBuildings = [...placedTurrets, ...placedFortifications];
    const buildingResolved = resolveBuildingCollision(resolved.x, resolved.z, 0.3, allBuildings);

    // Resolve creature collision (player vs zombies)
    const aliveEnemies = enemyManagerRef?.current?.getAliveEnemies() ?? [];
    const creatureResolved = resolveCreatureCollision(
      { x: buildingResolved.x, z: buildingResolved.z },
      0.3,
      aliveEnemies.map((e) => ({ x: e.x, z: e.z })),
      CREATURE_COLLISION_RADIUS,
    );

    const clamped = clampPosition(creatureResolved.x, pos.y, creatureResolved.z);
    pos.set(clamped.x, clamped.y, clamped.z);

    // Apply rotation (smooth)
    const targetRot = computeRotation(velocity);
    if (targetRot !== null) {
      let diff = targetRot - currentRotation.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      currentRotation.current += diff * 0.35;
      groupRef.current.rotation.y = currentRotation.current;
    }

    // Bobbing animation while moving
    if (isMoving) {
      const time = performance.now() * 0.01;
      const bob = Math.sin(time) * 0.15;
      if (leftLegRef.current) leftLegRef.current.rotation.x = bob;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -bob;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -bob * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = bob * 0.8;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshToonMaterial color={BODY_COLOR} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.35, 12, 8]} />
        <meshToonMaterial color={HEAD_COLOR} />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.12, 1.7, 0.3]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.12, 1.7, 0.3]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color={EYE_COLOR} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.4, 0.9, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshToonMaterial color={LIMB_COLOR} />
      </mesh>

      {/* Right Arm + Bat */}
      <mesh ref={rightArmRef} position={[0.4, 0.9, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshToonMaterial color={LIMB_COLOR} />
      </mesh>

      <BatWeapon />

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.15, 0.25, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshToonMaterial color={LIMB_COLOR} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.15, 0.25, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshToonMaterial color={LIMB_COLOR} />
      </mesh>
    </group>
  );
});
