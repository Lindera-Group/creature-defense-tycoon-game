import { FOREST_CONFIG } from "./forestHelpers";

export function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry
        args={[FOREST_CONFIG.groundWidth, FOREST_CONFIG.groundDepth]}
      />
      <meshToonMaterial color={FOREST_CONFIG.groundColor} />
    </mesh>
  );
}
