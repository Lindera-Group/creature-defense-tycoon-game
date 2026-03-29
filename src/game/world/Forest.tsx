import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Trees } from "./Trees";
import { ForestLighting } from "./ForestLighting";
import { FOREST_CONFIG } from "./forestHelpers";
import { useGameStore } from "@game/stores/gameStore";
import type { RebirthPhase } from "@shared/types";

interface PhaseVisuals {
  sky: string;
  fog: string;
  ground: string;
  ambientColor: string;
  ambientIntensity: number;
  dirLightColor: string;
  dirLightIntensity: number;
  hasMoon: boolean;
  moonColor: string;
  moonEmissive: string;
  moonEmissiveIntensity: number;
  hasCorona: boolean;
  moonPulse: boolean;
}

const PHASE_VISUALS: Record<RebirthPhase, PhaseVisuals> = {
  0: {
    sky: "#87CEEB",
    fog: "#87CEEB",
    ground: "#3a7d2c",
    ambientColor: "#FFF8E1",
    ambientIntensity: 0.5,
    dirLightColor: "#ffffff",
    dirLightIntensity: 1.2,
    hasMoon: false,
    moonColor: "#ffffff",
    moonEmissive: "#ffffff",
    moonEmissiveIntensity: 1,
    hasCorona: false,
    moonPulse: false,
  },
  1: {
    sky: "#1a1a3e",
    fog: "#1a2040",
    ground: "#2d5a1e",
    ambientColor: "#8899cc",
    ambientIntensity: 0.35,
    dirLightColor: "#aabbff",
    dirLightIntensity: 0.6,
    hasMoon: true,
    moonColor: "#fffde0",
    moonEmissive: "#e8e0a0",
    moonEmissiveIntensity: 1.2,
    hasCorona: false,
    moonPulse: false,
  },
  2: {
    sky: "#0a0a1a",
    fog: "#180a2a",
    ground: "#1a3a1a",
    ambientColor: "#553366",
    ambientIntensity: 0.25,
    dirLightColor: "#9966cc",
    dirLightIntensity: 0.3,
    hasMoon: true,
    moonColor: "#111122",
    moonEmissive: "#000000",
    moonEmissiveIntensity: 0,
    hasCorona: true,
    moonPulse: false,
  },
  3: {
    sky: "#1a0000",
    fog: "#2a0808",
    ground: "#2a1a0a",
    ambientColor: "#ff4422",
    ambientIntensity: 0.3,
    dirLightColor: "#ff3300",
    dirLightIntensity: 0.5,
    hasMoon: true,
    moonColor: "#cc2200",
    moonEmissive: "#aa1100",
    moonEmissiveIntensity: 1.5,
    hasCorona: false,
    moonPulse: true,
  },
};

function Moon({ visuals }: { visuals: PhaseVisuals }) {
  const moonMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    if (!moonMatRef.current || !visuals.moonPulse) return;
    const t = Math.sin(clock.getElapsedTime() * 1.8) * 0.5 + 0.5; // 0..1
    moonMatRef.current.emissiveIntensity = visuals.moonEmissiveIntensity + t * 0.8;
  });

  if (!visuals.hasMoon) return null;

  return (
    <group position={[0, 60, -80]}>
      {/* Main moon sphere */}
      <mesh>
        <sphereGeometry args={[8, 16, 12]} />
        {visuals.moonPulse ? (
          <meshStandardMaterial
            ref={moonMatRef}
            color={visuals.moonColor}
            emissive={visuals.moonEmissive}
            emissiveIntensity={visuals.moonEmissiveIntensity}
            toneMapped={false}
          />
        ) : (
          <meshBasicMaterial
            color={visuals.moonColor}
            toneMapped={false}
          />
        )}
      </mesh>

      {/* Eclipse corona ring */}
      {visuals.hasCorona && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[9, 13, 32]} />
            <meshBasicMaterial
              color="#ff8800"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[13, 18, 32]} />
            <meshBasicMaterial
              color="#ff4400"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function PhaseGround({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[FOREST_CONFIG.worldRadius, 64]} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

function PhaseLighting({ visuals }: { visuals: PhaseVisuals }) {
  return (
    <>
      <ambientLight intensity={visuals.ambientIntensity} color={visuals.ambientColor} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={visuals.dirLightIntensity}
        color={visuals.dirLightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
      />
    </>
  );
}

export function Forest() {
  const phase = useGameStore((s) => s.phase);
  const visuals = PHASE_VISUALS[phase];

  return (
    <>
      <color attach="background" args={[visuals.sky]} />
      <fog attach="fog" args={[visuals.fog, 35, 75]} />
      {phase === 0 ? <ForestLighting /> : <PhaseLighting visuals={visuals} />}
      <PhaseGround color={visuals.ground} />
      <Trees />
      <Moon visuals={visuals} />
    </>
  );
}
