import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBuildingStore } from "@game/stores/buildingStore";
import { Turret } from "@game/entities/Turret";
import type { EnemyManagerHandle } from "@game/entities/EnemyManager";
import type { ProjectileRequest } from "@game/systems/ProjectileSystem";
import { TURRETS } from "@shared/constants";
import {
  findBestTarget,
  canTurretFire,
  computeTurretProjectile,
} from "@game/systems/turretHelpers";

interface TurretSystemProps {
  enemyManagerRef: React.RefObject<EnemyManagerHandle | null>;
  onSpawnProjectile: (request: ProjectileRequest) => void;
}

interface TurretState {
  lastFireTime: number;
  currentTarget: [number, number, number] | null;
}

export function TurretSystem({ enemyManagerRef, onSpawnProjectile }: TurretSystemProps) {
  const placedTurrets = useBuildingStore((s) => s.placedTurrets);
  const turretStatesRef = useRef<Map<string, TurretState>>(new Map());

  // AI loop: targeting and firing
  useFrame(() => {
    const enemyManager = enemyManagerRef.current;
    if (!enemyManager) return;

    const aliveEnemies = enemyManager.getAliveEnemies();
    const now = performance.now();

    // Clean up states for removed turrets
    const currentTurretIds = new Set(placedTurrets.map((t) => t.id));
    for (const id of turretStatesRef.current.keys()) {
      if (!currentTurretIds.has(id)) {
        turretStatesRef.current.delete(id);
      }
    }

    // Process each turret
    for (const turret of placedTurrets) {
      const config = TURRETS[turret.type];
      if (!config) continue;

      // Initialize state if needed
      if (!turretStatesRef.current.has(turret.id)) {
        turretStatesRef.current.set(turret.id, {
          lastFireTime: 0,
          currentTarget: null,
        });
      }

      const state = turretStatesRef.current.get(turret.id)!;

      // Find best target
      const target = findBestTarget(
        { x: turret.position[0], z: turret.position[2] },
        aliveEnemies,
        config.range
      );

      // Update current target for barrel rotation
      if (target) {
        state.currentTarget = [target.x, 0, target.z];
      } else {
        state.currentTarget = null;
      }

      // Check if can fire
      if (target && canTurretFire(state.lastFireTime, config.attackSpeed, now)) {
        // Compute and spawn projectile
        const projectileData = computeTurretProjectile(
          turret.position,
          [target.x, 0, target.z],
          config
        );

        onSpawnProjectile(projectileData);

        // Update last fire time
        state.lastFireTime = now;
      }
    }
  });

  return (
    <group>
      {placedTurrets.map((turret) => {
        const state = turretStatesRef.current.get(turret.id);
        return (
          <Turret
            key={turret.id}
            id={turret.id}
            type={turret.type}
            position={turret.position}
            health={turret.health}
            maxHealth={200}
            targetPos={state?.currentTarget || null}
            rotation={turret.rotation}
          />
        );
      })}
    </group>
  );
}
