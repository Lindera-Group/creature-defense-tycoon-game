import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function LoadingScreen() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2e",
        color: "#e0e0e0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "2rem",
      }}
    >
      Loading Creature Defense Tycoon...
    </div>
  );
}

export function App() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 10, 15], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          {/* Game world will be mounted here */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#2d5a1e" />
          </mesh>
        </Suspense>
      </Canvas>
      <LoadingScreen />
    </>
  );
}
