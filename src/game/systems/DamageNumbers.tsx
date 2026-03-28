import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

interface DamageNumber {
  id: number;
  position: THREE.Vector3;
  damage: number;
  createdAt: number;
  lifetime: number; // 0 to 1 progress
}

export interface DamageNumbersHandle {
  addDamageNumber: (position: [number, number, number], damage: number) => void;
}

const ANIMATION_DURATION = 0.8; // seconds
const FLOAT_HEIGHT = 2; // units to float upward
const POP_DURATION = 0.1; // quick pop-in at start

export const DamageNumbers = forwardRef<DamageNumbersHandle>((_, ref) => {
  const [numbers, setNumbers] = useState<DamageNumber[]>([]);
  const nextIdRef = useRef(0);

  useImperativeHandle(ref, () => ({
    addDamageNumber: (position: [number, number, number], damage: number) => {
      const id = nextIdRef.current++;
      const newNumber: DamageNumber = {
        id,
        position: new THREE.Vector3(...position),
        damage,
        createdAt: performance.now(),
        lifetime: 0,
      };
      setNumbers((prev) => [...prev, newNumber]);
    },
  }));

  useFrame(() => {
    const now = performance.now();

    // Update lifetimes and remove expired numbers
    setNumbers((prev) => {
      const updated = prev.map((num) => {
        const elapsed = (now - num.createdAt) / 1000;
        const lifetime = Math.min(elapsed / ANIMATION_DURATION, 1);
        return { ...num, lifetime };
      });

      // Keep only numbers that haven't expired
      return updated.filter((num) => num.lifetime < 1);
    });
  });

  return (
    <group>
      {numbers.map((num) => {
        // Pop-in scale animation (0 -> 1 quickly)
        const popProgress = Math.min(num.lifetime / POP_DURATION, 1);
        const popScale = popProgress < 1
          ? popProgress * popProgress // Ease in quad
          : 1;

        // Float upward with ease-out
        const floatProgress = num.lifetime;
        const yOffset = floatProgress * FLOAT_HEIGHT * (1 - floatProgress * 0.3); // slight ease-out

        // Fade out in last 30% of animation
        const fadeStart = 0.7;
        const opacity = num.lifetime > fadeStart
          ? 1 - ((num.lifetime - fadeStart) / (1 - fadeStart))
          : 1;

        const position: [number, number, number] = [
          num.position.x,
          num.position.y + yOffset,
          num.position.z,
        ];

        return (
          <Billboard
            key={num.id}
            position={position}
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <Text
              fontSize={0.5}
              color="#FFD700" // Gold/yellow
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.03}
              outlineColor="#000000" // Black outline for readability
              scale={popScale}
              fillOpacity={opacity}
              outlineOpacity={opacity * 0.8}
            >
              {num.damage}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
});

DamageNumbers.displayName = "DamageNumbers";
