import { useRef, useCallback, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Zombie } from "./Zombie";
import { useGameStore } from "@game/stores/gameStore";

interface EnemyInstance {
  id: string;
  position: [number, number, number];
  alive: boolean;
}

export interface EnemyManagerHandle {
  spawnEnemy: (position: [number, number, number]) => void;
  getAliveEnemies: () => Array<{
    id: string;
    x: number;
    z: number;
    health: number;
    takeDamage: (amount: number) => void;
  }>;
}

export const EnemyManager = forwardRef<
  EnemyManagerHandle,
  { playerRef: React.RefObject<THREE.Group | null>; onEnemyDeath: (position: [number, number, number]) => void }
>(function EnemyManager({ playerRef, onEnemyDeath }, ref) {
  const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
  const zombieGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const nextIdRef = useRef(0);
  const setEnemiesAlive = useGameStore((s) => s.setEnemiesAlive);
  const gameOver = useGameStore((s) => s.gameOver);
  const gameStarted = useGameStore((s) => s.gameStarted);

  // Clear all enemies when game resets (gameOver goes false and gameStarted goes false)
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      setEnemies([]);
      zombieGroupsRef.current.clear();
      nextIdRef.current = 0;
      setEnemiesAlive(0);
    }
  }, [gameStarted, gameOver, setEnemiesAlive]);

  const spawnEnemy = useCallback(
    (position: [number, number, number]) => {
      const id = `zombie-${nextIdRef.current++}`;
      setEnemies((prev) => {
        const next = [...prev, { id, position, alive: true }];
        setEnemiesAlive(next.filter((e) => e.alive).length);
        return next;
      });
    },
    [setEnemiesAlive],
  );

  const getAliveEnemies = useCallback(() => {
    const result: Array<{
      id: string;
      x: number;
      z: number;
      health: number;
      takeDamage: (amount: number) => void;
    }> = [];

    for (const [id, group] of zombieGroupsRef.current) {
      // The zombie's outer group is the first child of our wrapper group
      const zombieGroup = group.children[0];
      const handle = zombieGroup?.userData?.zombieHandle;
      if (handle && handle.healthRef.current > 0) {
        result.push({
          id,
          x: zombieGroup.position.x,
          z: zombieGroup.position.z,
          health: handle.healthRef.current,
          takeDamage: handle.takeDamage,
        });
      }
    }
    return result;
  }, []);

  useImperativeHandle(ref, () => ({ spawnEnemy, getAliveEnemies }), [
    spawnEnemy,
    getAliveEnemies,
  ]);

  const handleDeath = useCallback(
    (id: string, position: [number, number, number]) => {
      setEnemies((prev) => {
        const next = prev.map((e) =>
          e.id === id ? { ...e, alive: false } : e,
        );
        setEnemiesAlive(next.filter((e) => e.alive).length);
        return next;
      });
      onEnemyDeath(position);
    },
    [setEnemiesAlive, onEnemyDeath],
  );

  const handleDamagePlayer = useCallback((damage: number) => {
    useGameStore.getState().takeDamage(damage);
  }, []);

  const handleTakeDamage = useCallback((_id: string, _damage: number) => {
    // Handled directly via zombie handle
  }, []);

  return (
    <group>
      {enemies
        .filter((e) => e.alive)
        .map((enemy) => (
          <group
            key={enemy.id}
            ref={(g) => {
              if (g) zombieGroupsRef.current.set(enemy.id, g);
              else zombieGroupsRef.current.delete(enemy.id);
            }}
          >
            <Zombie
              id={enemy.id}
              startPosition={enemy.position}
              playerRef={playerRef}
              onDeath={handleDeath}
              onDamagePlayer={handleDamagePlayer}
              onTakeDamage={handleTakeDamage}
            />
          </group>
        ))}
    </group>
  );
});
