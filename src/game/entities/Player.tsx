import { useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardInput } from "@game/hooks/useKeyboardInput";
import { useFollowCamera } from "@game/hooks/useFollowCamera";
import {
  computeMovementVelocity,
  clampPosition,
  computeRotation,
  PLAYER_SPEED,
} from "./playerHelpers";
import { resolveTreeCollision } from "@game/world/forestHelpers";
import { BatWeapon } from "./BatWeapon";

const BODY_COLOR = "#FFD700";
const HEAD_COLOR = "#FFCC80";
const EYE_COLOR = "#111111";
const LIMB_COLOR = "#4488CC";

export const Player = forwardRef<THREE.Group>(function Player(_, ref) {
  const groupRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Mesh>(null!);
  const rightLegRef = useRef<THREE.Mesh>(null!);
  const leftArmRef = useRef<THREE.Mesh>(null!);
  const rightArmRef = useRef<THREE.Mesh>(null!);

  const keys = useKeyboardInput();
  useFollowCamera(groupRef);

  // Expose the group ref
  useImperativeHandle(ref, () => groupRef.current, []);

  const currentRotation = useRef(Math.PI);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const velocity = computeMovementVelocity(keys.current);
    const isMoving = velocity.x !== 0 || velocity.z !== 0;

    // Apply movement with tree collision
    const pos = groupRef.current.position;
    const newX = pos.x + velocity.x * PLAYER_SPEED * delta;
    const newZ = pos.z + velocity.z * PLAYER_SPEED * delta;
    const resolved = resolveTreeCollision(newX, newZ, 0.3);
    const clamped = clampPosition(resolved.x, pos.y, resolved.z);
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
