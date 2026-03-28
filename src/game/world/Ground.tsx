import { FOREST_CONFIG } from "./forestHelpers";

export function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <circleGeometry args={[FOREST_CONFIG.worldRadius, 64]} />
      <meshToonMaterial color={FOREST_CONFIG.groundColor} />
    </mesh>
  );
}
