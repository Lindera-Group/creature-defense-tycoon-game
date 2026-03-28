import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EnemyManagerHandle } from "@game/entities/EnemyManager";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { getTreePositions } from "@game/world/forestHelpers";
import {
  checkProjectileObstacleHit,
  buildObstacleList,
} from "./projectileCollisionHelpers";

export interface ProjectileRequest {
  start: [number, number, number];
  target: [number, number, number];
  speed: number;
  damage: number;
  aoeRadius?: number;
  color: string;
}

export interface ProjectileSystemHandle {
  spawnProjectile: (request: ProjectileRequest) => void;
}

interface Projectile extends ProjectileRequest {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  createdAt: number;
}

interface ProjectileSystemProps {
  enemyManagerRef: React.RefObject<EnemyManagerHandle | null>;
  onImpact?: (position: [number, number, number], damage: number) => void;
}

const ProjectileSystem = forwardRef<ProjectileSystemHandle, ProjectileSystemProps>(
  ({ enemyManagerRef, onImpact }, ref) => {
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const gameStarted = useGameStore((s) => s.gameStarted);
    const gameOver = useGameStore((s) => s.gameOver);

    // Clear projectiles on game reset
    useEffect(() => {
      if (!gameStarted && !gameOver) {
        setProjectiles([]);
      }
    }, [gameStarted, gameOver]);

    // Expose spawnProjectile to parent via ref
    useImperativeHandle(ref, () => ({
      spawnProjectile: (request: ProjectileRequest) => {
        const direction = new THREE.Vector3(
          request.target[0] - request.start[0],
          request.target[1] - request.start[1],
          request.target[2] - request.start[2]
        ).normalize();

        const newProjectile: Projectile = {
          ...request,
          id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          position: new THREE.Vector3(...request.start),
          direction,
          createdAt: performance.now(),
        };

        setProjectiles((prev) => [...prev, newProjectile]);
      },
    }));

    // Update projectiles each frame
    useFrame((_, delta) => {
      if (projectiles.length === 0) return;

      const now = performance.now();
      const projectilesToRemove: string[] = [];

      // Build obstacle list once per frame
      const placedTurrets = useBuildingStore.getState().placedTurrets;
      const placedFortifications = useBuildingStore.getState().placedFortifications;
      const obstacles = buildObstacleList(
        [...placedTurrets, ...placedFortifications],
        getTreePositions(),
      );

      setProjectiles((prev) => {
        return prev
          .map((proj) => {
            // Remove if too old (3 seconds)
            if (now - proj.createdAt > 3000) {
              projectilesToRemove.push(proj.id);
              return null;
            }

            // Save previous position for collision check
            const prevX = proj.position.x;
            const prevZ = proj.position.z;

            // Move projectile
            const movement = proj.direction.clone().multiplyScalar(proj.speed * delta);
            proj.position.add(movement);

            // Check obstacle collision (buildings and trees)
            const hit = checkProjectileObstacleHit(
              prevX,
              prevZ,
              proj.position.x,
              proj.position.z,
              obstacles,
            );
            if (hit) {
              // Projectile hit obstacle - remove it
              projectilesToRemove.push(proj.id);
              return null;
            }

            // Check if reached target
            const targetVec = new THREE.Vector3(...proj.target);
            const distanceToTarget = proj.position.distanceTo(targetVec);

            if (distanceToTarget < 0.5) {
              // Impact! Apply damage
              applyDamage(proj);
              projectilesToRemove.push(proj.id);
              return null;
            }

            return proj;
          })
          .filter((p): p is Projectile => p !== null);
      });
    });

    // Apply damage on impact
    const applyDamage = (proj: Projectile) => {
      const enemyManager = enemyManagerRef.current;
      if (!enemyManager) return;

      const aliveEnemies = enemyManager.getAliveEnemies();
      if (aliveEnemies.length === 0) return;

      let didHit = false;

      if (proj.aoeRadius !== undefined && proj.aoeRadius > 0) {
        // AOE damage
        const impactPos = new THREE.Vector3(...proj.target);
        aliveEnemies.forEach((enemy) => {
          const enemyPos = new THREE.Vector3(enemy.x, 0, enemy.z);
          const distance = impactPos.distanceTo(enemyPos);
          if (distance <= proj.aoeRadius!) {
            enemy.takeDamage(proj.damage);
            didHit = true;
          }
        });
      } else {
        // Direct damage - find closest enemy to target
        const impactPos = new THREE.Vector3(...proj.target);
        let closestEnemy = aliveEnemies[0];
        let closestDistance = new THREE.Vector3(
          closestEnemy.x,
          0,
          closestEnemy.z
        ).distanceTo(impactPos);

        for (let i = 1; i < aliveEnemies.length; i++) {
          const enemy = aliveEnemies[i];
          const enemyPos = new THREE.Vector3(enemy.x, 0, enemy.z);
          const distance = enemyPos.distanceTo(impactPos);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
          }
        }

        // Apply damage if enemy is reasonably close (within 2 units)
        if (closestDistance < 2) {
          closestEnemy.takeDamage(proj.damage);
          didHit = true;
        }
      }

      // Only show damage number and register hit on actual impact
      if (didHit && onImpact) {
        onImpact(proj.target, proj.damage);
      }
    };

    return (
      <group>
        {projectiles.map((proj) => (
          <ProjectileVisual key={proj.id} projectile={proj} />
        ))}
      </group>
    );
  }
);

ProjectileSystem.displayName = 'ProjectileSystem';

// Individual projectile visual component
interface ProjectileVisualProps {
  projectile: Projectile;
}

function ProjectileVisual({ projectile }: ProjectileVisualProps) {
  const { position, direction, color } = projectile;

  // Calculate rotation to face movement direction
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  quaternion.setFromUnitVectors(up, direction);

  // Elongate slightly in movement direction for trail effect
  const scale: [number, number, number] = [0.12, 0.25, 0.12];

  return (
    <mesh
      position={[position.x, position.y, position.z]}
      quaternion={quaternion}
      scale={scale}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

export { ProjectileSystem };
