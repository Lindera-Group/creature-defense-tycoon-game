import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import { Forest } from "@game/world/Forest";
import { Player } from "@game/entities/Player";
import { EnemyManager, type EnemyManagerHandle } from "@game/entities/EnemyManager";
import { BuildingManager } from "@game/entities/BuildingManager";
import { CombatSystem } from "@game/systems/CombatSystem";
import { CoinSystem } from "@game/systems/CoinSystem";
import { WaveSystem } from "@game/systems/WaveSystem";
import { DamageNumbers, type DamageNumbersHandle } from "@game/systems/DamageNumbers";
import { ProjectileSystem, type ProjectileSystemHandle, type ProjectileRequest } from "@game/systems/ProjectileSystem";
import { TurretSystem } from "@game/systems/TurretSystem";
import { HUD } from "@game/ui/HUD";
import { BossHealthBar } from "@game/ui/BossHealthBar";
import { WeaponPickupButton } from "@game/ui/WeaponPickupButton";
import { Shop } from "@game/ui/Shop";
import { PlacementPreview } from "@game/ui/PlacementPreview";
import { PlacementHUD } from "@game/ui/PlacementHUD";
import { StartScreen } from "@game/ui/StartScreen";
import { GameOverScreen } from "@game/ui/GameOverScreen";
import { VictoryScreen } from "@game/ui/VictoryScreen";
import { WaveAnnouncement } from "@game/ui/WaveAnnouncement";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useBuildingStore } from "@game/stores/buildingStore";

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  const enemyManagerRef = useRef<EnemyManagerHandle>(null);
  const damageNumbersRef = useRef<DamageNumbersHandle>(null);
  const projectileRef = useRef<ProjectileSystemHandle>(null);

  // CHEATS: M = +5000 coins, N = kill all + skip wave, P = skip to next phase
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        useEconomyStore.getState().addCoins(5000);
      }
      if (e.key === "n" || e.key === "N") {
        useEconomyStore.getState().addCoins(5000);
        enemyManagerRef.current?.killAllEnemies();
      }
      if (e.key === "p" || e.key === "P") {
        // Skip to next phase (rebirth)
        const store = useGameStore.getState();
        if (store.phase < 3) {
          enemyManagerRef.current?.killAllEnemies();
          useBuildingStore.getState().resetBuildings();
          store.rebirth();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleEnemyDeath = useCallback((position: [number, number, number], enemyType: string) => {
    useEconomyStore.getState().queueCoinSpawn(position, enemyType);
  }, []);

  const handleHit = useCallback((position: [number, number, number], damage: number) => {
    damageNumbersRef.current?.addDamageNumber(position, damage);
  }, []);

  const handleSpawnProjectile = useCallback((request: ProjectileRequest) => {
    projectileRef.current?.spawnProjectile(request);
  }, []);

  return (
    <>
      <Forest />
      <Player ref={playerRef} enemyManagerRef={enemyManagerRef} />
      <EnemyManager
        ref={enemyManagerRef}
        playerRef={playerRef}
        onEnemyDeath={handleEnemyDeath}
      />
      <BuildingManager />
      <CombatSystem
        playerRef={playerRef}
        enemyManagerRef={enemyManagerRef}
        onHit={handleHit}
        onSpawnProjectile={handleSpawnProjectile}
      />
      <CoinSystem playerRef={playerRef} />
      <WaveSystem enemyManagerRef={enemyManagerRef} />
      <DamageNumbers ref={damageNumbersRef} />
      <ProjectileSystem ref={projectileRef} enemyManagerRef={enemyManagerRef} onImpact={handleHit} />
      <TurretSystem enemyManagerRef={enemyManagerRef} onSpawnProjectile={handleSpawnProjectile} />
      <PlacementPreview />
    </>
  );
}

export function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameOver = useGameStore((s) => s.gameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const announcement = useGameStore((s) => s.announcement);

  return (
    <>
      <Canvas
        camera={{ position: [0, 8, 12], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>

      {!gameStarted && <StartScreen />}
      {!gameStarted && <WeaponPickupButton />}
      {gameStarted && !gameOver && !isVictory && <HUD />}
      {gameStarted && !gameOver && !isVictory && <BossHealthBar />}
      {gameStarted && !gameOver && !isVictory && <Shop />}
      {gameStarted && !gameOver && !isVictory && <PlacementHUD />}
      {gameOver && !isVictory && <GameOverScreen />}
      {isVictory && <VictoryScreen />}
      {announcement && <WaveAnnouncement text={announcement} />}
    </>
  );
}
