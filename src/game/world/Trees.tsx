import { useMemo } from "react";
import {
  createTreeGeometry,
  getTreePositions,
} from "./forestHelpers";

const CANOPY_COLORS = ["#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A"];
const TRUNK_COLOR = "#8B4513";

function Tree({
  x,
  z,
  seed,
}: {
  x: number;
  z: number;
  seed: number;
}) {
  const geo = useMemo(() => createTreeGeometry(seed), [seed]);
  const canopyColor = CANOPY_COLORS[seed % CANOPY_COLORS.length];
  const canopyY = geo.trunkHeight + geo.canopyRadius * 0.6;

  return (
    <group position={[x, 0, z]}>
      {/* Trunk */}
      <mesh
        position={[0, geo.trunkHeight / 2, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[geo.trunkRadius, geo.trunkRadius * 1.3, geo.trunkHeight, 6]}
        />
        <meshToonMaterial color={TRUNK_COLOR} />
      </mesh>

      {/* Canopy */}
      <mesh position={[0, canopyY, 0]} castShadow>
        {geo.canopyType === "sphere" ? (
          <sphereGeometry args={[geo.canopyRadius, 8, 6]} />
        ) : (
          <coneGeometry
            args={[geo.canopyRadius, geo.canopyRadius * 2, 6]}
          />
        )}
        <meshToonMaterial color={canopyColor} />
      </mesh>
    </group>
  );
}

export function Trees() {
  const trees = useMemo(() => {
    const positions = getTreePositions();
    return positions.map((pos, i) => ({
      ...pos,
      seed: i,
      key: `tree-${i}`,
    }));
  }, []);

  return (
    <group>
      {trees.map((t) => (
        <Tree key={t.key} x={t.x} z={t.z} seed={t.seed} />
      ))}
    </group>
  );
}
