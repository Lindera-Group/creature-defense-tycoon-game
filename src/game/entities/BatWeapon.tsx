import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@game/stores/gameStore";
import { useCombatStore } from "@game/stores/combatStore";

const SWING_DURATION = 200; // ms
const RECOIL_AMOUNT = 0.3; // How far back ranged weapons kick

// Melee weapons use swing animation
const MELEE_WEAPONS = ["bat", "spiked_bat"];

// Ranged weapons use recoil animation
const RANGED_WEAPONS = [
  "crossbow",
  "shotgun",
  "rifle",
  "minigun",
  "rocket_launcher",
];

/**
 * Bat weapon model - simple wooden stick
 */
function BatModel() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.1, 1.0, 0.1]} />
      <meshToonMaterial color="#8B7355" />
    </mesh>
  );
}

/**
 * Spiked bat model - gray stick with cone spikes
 */
function SpikedBatModel() {
  return (
    <>
      <mesh castShadow>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshToonMaterial color="#666666" />
      </mesh>
      <mesh position={[0.08, 0.4, 0]} castShadow>
        <coneGeometry args={[0.04, 0.12, 4]} />
        <meshToonMaterial color="#999999" />
      </mesh>
      <mesh position={[-0.08, 0.35, 0]} castShadow>
        <coneGeometry args={[0.04, 0.12, 4]} />
        <meshToonMaterial color="#999999" />
      </mesh>
      <mesh position={[0.06, 0.25, 0.06]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.04, 0.12, 4]} />
        <meshToonMaterial color="#999999" />
      </mesh>
    </>
  );
}

/**
 * Crossbow model - T-shaped with horizontal bar and vertical grip
 */
function CrossbowModel() {
  return (
    <>
      {/* Horizontal bar (bow) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshToonMaterial color="#8B7355" />
      </mesh>
      {/* Vertical grip/stock */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.06]} />
        <meshToonMaterial color="#8B7355" />
      </mesh>
      {/* String */}
      <mesh position={[0, 0.3, -0.02]} castShadow>
        <boxGeometry args={[0.35, 0.01, 0.01]} />
        <meshToonMaterial color="#4A4A4A" />
      </mesh>
      {/* Arrow */}
      <mesh position={[0, 0.3, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
    </>
  );
}

/**
 * Shotgun model - thick barrel with wooden stock
 */
function ShotgunModel() {
  return (
    <>
      {/* Barrel */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      {/* Stock */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[0.06, 0.3, 0.04]} />
        <meshToonMaterial color="#8B7355" />
      </mesh>
      {/* Fore-end grip */}
      <mesh position={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.06]} />
        <meshToonMaterial color="#8B7355" />
      </mesh>
      {/* Pump action */}
      <mesh position={[0, 0, 0.08]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.08]} />
        <meshToonMaterial color="#555555" />
      </mesh>
    </>
  );
}

/**
 * Rifle model - long thin barrel with stock and scope
 */
function RifleModel() {
  return (
    <>
      {/* Long barrel */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshToonMaterial color="#222222" />
      </mesh>
      {/* Stock */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.06, 0.25, 0.04]} />
        <meshToonMaterial color="#8B7355" />
      </mesh>
      {/* Magazine */}
      <mesh position={[0, -0.1, 0.06]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.08]} />
        <meshToonMaterial color="#333333" />
      </mesh>
      {/* Scope - cylindrical */}
      <mesh position={[0, 0.2, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshToonMaterial color="#1A1A1A" />
      </mesh>
      {/* Scope mounts */}
      <mesh position={[0, 0.1, 0.04]} castShadow>
        <boxGeometry args={[0.01, 0.02, 0.02]} />
        <meshToonMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0.3, 0.04]} castShadow>
        <boxGeometry args={[0.01, 0.02, 0.02]} />
        <meshToonMaterial color="#333333" />
      </mesh>
    </>
  );
}

/**
 * Minigun model - multiple barrels bundled together
 */
function MinigunModel() {
  const barrelCount = 4;
  const barrelRadius = 0.08;

  return (
    <>
      {/* Multiple barrels arranged in circle */}
      {Array.from({ length: barrelCount }).map((_, i) => {
        const angle = (i / barrelCount) * Math.PI * 2;
        const x = Math.cos(angle) * barrelRadius;
        const z = Math.sin(angle) * barrelRadius;

        return (
          <mesh
            key={i}
            position={[x, 0.2, z]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
            <meshToonMaterial color="#888888" />
          </mesh>
        );
      })}

      {/* Housing rings */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.1, 0.02, 8, 8]} />
        <meshToonMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.1, 0.02, 8, 8]} />
        <meshToonMaterial color="#666666" />
      </mesh>

      {/* Handle underneath */}
      <mesh position={[0, -0.15, 0.1]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <meshToonMaterial color="#444444" />
      </mesh>

      {/* Ammo box/battery */}
      <mesh position={[0, -0.15, -0.15]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.15]} />
        <meshToonMaterial color="#555555" />
      </mesh>
    </>
  );
}

/**
 * Rocket launcher model - thick tube with flared end
 */
function RocketLauncherModel() {
  return (
    <>
      {/* Main tube */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshToonMaterial color="#556B2F" />
      </mesh>

      {/* Flared front end */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.1, 8]} />
        <meshToonMaterial color="#556B2F" />
      </mesh>

      {/* Rear sight */}
      <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.08, 8]} />
        <meshToonMaterial color="#4A5D2A" />
      </mesh>

      {/* Handle/grip */}
      <mesh position={[0, -0.1, 0.1]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.08]} />
        <meshToonMaterial color="#444444" />
      </mesh>

      {/* Trigger guard */}
      <mesh position={[0, -0.05, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.04, 0.01, 6, 8]} />
        <meshToonMaterial color="#333333" />
      </mesh>

      {/* Shoulder rest */}
      <mesh position={[0, -0.15, -0.15]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshToonMaterial color="#4A5D2A" />
      </mesh>
    </>
  );
}

export function BatWeapon() {
  const groupRef = useRef<THREE.Group>(null!);
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const lastAttackTime = useCombatStore((s) => s.lastAttackTime);
  const prevAttackRef = useRef(0);

  const isMelee = equippedWeapon ? MELEE_WEAPONS.includes(equippedWeapon) : false;
  const isRanged = equippedWeapon ? RANGED_WEAPONS.includes(equippedWeapon) : false;

  useFrame(() => {
    if (!groupRef.current) return;

    const now = performance.now();
    const timeSinceAttack = now - lastAttackTime;

    // Detect new attack
    if (lastAttackTime !== prevAttackRef.current) {
      prevAttackRef.current = lastAttackTime;
    }

    if (timeSinceAttack < SWING_DURATION) {
      const t = timeSinceAttack / SWING_DURATION;

      if (isMelee) {
        // Melee: swing animation (rotate forward and back)
        const swing = Math.sin(t * Math.PI) * 1.5;
        groupRef.current.rotation.x = -swing;
        groupRef.current.position.z = 0.3;
      } else if (isRanged) {
        // Ranged: recoil animation (kick back on Z axis)
        const recoil = Math.sin(t * Math.PI) * RECOIL_AMOUNT;
        groupRef.current.rotation.x = 0;
        groupRef.current.position.z = 0.3 - recoil;
      }
    } else {
      // Idle sway (all weapons)
      groupRef.current.rotation.x = 0;
      groupRef.current.position.z = 0.3;
      groupRef.current.rotation.z =
        Math.sin(performance.now() * 0.002) * 0.05 - 0.3;
    }
  });

  if (!equippedWeapon) return null;

  // Render appropriate weapon model
  const renderWeaponModel = () => {
    switch (equippedWeapon) {
      case "bat":
        return <BatModel />;
      case "spiked_bat":
        return <SpikedBatModel />;
      case "crossbow":
        return <CrossbowModel />;
      case "shotgun":
        return <ShotgunModel />;
      case "rifle":
        return <RifleModel />;
      case "minigun":
        return <MinigunModel />;
      case "rocket_launcher":
        return <RocketLauncherModel />;
      default:
        return <BatModel />; // Fallback to basic bat
    }
  };

  return (
    <group ref={groupRef} position={[0.5, 0.7, 0.3]} rotation={[0, 0, -0.3]}>
      {renderWeaponModel()}
    </group>
  );
}
