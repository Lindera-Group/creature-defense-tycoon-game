import { useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCombatStore } from "@game/stores/combatStore";
import { useGameStore } from "@game/stores/gameStore";
import type { EnemyManagerHandle } from "@game/entities/EnemyManager";
import type { ProjectileRequest } from "@game/systems/ProjectileSystem";
import { findEnemiesInRange, isInFrontArc } from "./combatHelpers";

// Projectile colors per weapon type
const PROJECTILE_COLORS: Record<string, string> = {
  crossbow: "#8B7355",
  shotgun: "#888888",
  rifle: "#FFD700",
  minigun: "#FF8C00",
  rocket_launcher: "#FF4444",
};

interface CombatSystemProps {
  playerRef: React.RefObject<THREE.Group | null>;
  enemyManagerRef: React.RefObject<EnemyManagerHandle | null>;
  onHit: (position: [number, number, number], damage: number) => void;
  onSpawnProjectile?: (request: ProjectileRequest) => void;
}

export function CombatSystem({
  playerRef,
  enemyManagerRef,
  onHit,
  onSpawnProjectile,
}: CombatSystemProps) {
  const spaceHeldRef = useRef(false);

  const tryAttack = useCallback(() => {
    if (!playerRef.current || !enemyManagerRef.current) return;

    const store = useCombatStore.getState();
    if (!store.canAttack()) return;

    const weaponConfig = store.getWeaponConfig();
    if (!weaponConfig) return;

    const damage = store.performAttack();
    if (damage === 0) return;

    const playerPos = playerRef.current.position;
    const playerRot = playerRef.current.rotation.y;

    const alive = enemyManagerRef.current.getAliveEnemies();
    const inRange = findEnemiesInRange(
      alive.map((e) => ({ id: e.id, x: e.x, z: e.z, health: e.health })),
      { x: playerPos.x, z: playerPos.z },
      weaponConfig.range,
    );

    // All weapons use 180° front arc
    const targets = inRange.filter((e) =>
      isInFrontArc({ x: playerPos.x, z: playerPos.z }, playerRot, {
        x: e.x,
        z: e.z,
      }),
    );

    if (targets.length === 0) return;

    // Find closest enemy
    let closest = targets[0];
    let closestDist = Infinity;
    for (const enemy of targets) {
      const dx = enemy.x - playerPos.x;
      const dz = enemy.z - playerPos.z;
      const d = dx * dx + dz * dz;
      if (d < closestDist) {
        closestDist = d;
        closest = enemy;
      }
    }

    if (weaponConfig.isRanged && onSpawnProjectile) {
      // Ranged: spawn projectile — hit registration and damage numbers
      // are deferred to ProjectileSystem.onImpact when projectile arrives
      onSpawnProjectile({
        start: [playerPos.x, 1.2, playerPos.z],
        target: [closest.x, 1, closest.z],
        speed: weaponConfig.projectileSpeed ?? 15,
        damage,
        aoeRadius: weaponConfig.aoeRadius,
        color: PROJECTILE_COLORS[weaponConfig.type] ?? "#FFFFFF",
      });

      // Auto-face the target for ranged weapons
      const dx = closest.x - playerPos.x;
      const dz = closest.z - playerPos.z;
      playerRef.current.rotation.y = Math.atan2(dx, dz);
    } else {
      // Melee: instant damage
      const liveEnemy = alive.find((e) => e.id === closest.id);
      if (liveEnemy) {
        liveEnemy.takeDamage(damage);
        store.registerHit(closest.id, damage);
        onHit([closest.x, 1, closest.z], damage);
      }
    }
  }, [playerRef, enemyManagerRef, onHit, onSpawnProjectile]);

  // Track space held for auto-attack
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spaceHeldRef.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeldRef.current = false;
      }
    };
    const onClick = () => {
      if (useGameStore.getState().gameStarted && !useGameStore.getState().gameOver) {
        tryAttack();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onClick);
    };
  }, [tryAttack]);

  // Auto-attack when holding space
  useFrame(() => {
    if (!spaceHeldRef.current) return;
    const { gameStarted, gameOver } = useGameStore.getState();
    if (!gameStarted || gameOver) return;
    tryAttack();
  });

  return null;
}
