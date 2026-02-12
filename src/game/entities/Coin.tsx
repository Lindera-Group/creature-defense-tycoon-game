import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoinProps {
  id: string;
  position: [number, number, number];
  amount: number;
  onCollect: (id: string, amount: number) => void;
  playerRef: React.RefObject<THREE.Group | null>;
}

const PICKUP_RADIUS = 3;
const MAGNET_RADIUS = 5;

export function Coin({ id, position, amount, onCollect, playerRef }: CoinProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const collectedRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || !playerRef.current || collectedRef.current) return;

    const coinPos = meshRef.current.position;
    const playerPos = playerRef.current.position;

    // Spin
    meshRef.current.rotation.y += delta * 3;

    // Float bob
    coinPos.y = position[1] + 0.5 + Math.sin(performance.now() * 0.003) * 0.2;

    // Distance to player
    const dx = playerPos.x - coinPos.x;
    const dz = playerPos.z - coinPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Magnet effect
    if (dist < MAGNET_RADIUS && dist > PICKUP_RADIUS) {
      const speed = 4 * delta;
      coinPos.x += (dx / dist) * speed;
      coinPos.z += (dz / dist) * speed;
    }

    // Collect
    if (dist < PICKUP_RADIUS) {
      collectedRef.current = true;
      onCollect(id, amount);
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.5, position[2]]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
      <meshToonMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  );
}
