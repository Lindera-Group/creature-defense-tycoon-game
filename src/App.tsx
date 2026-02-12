import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useCallback } from "react";
import * as THREE from "three";
import { Forest } from "@game/world/Forest";
import { Player } from "@game/entities/Player";
import { EnemyManager, type EnemyManagerHandle } from "@game/entities/EnemyManager";
import { CombatSystem } from "@game/systems/CombatSystem";
import { CoinSystem } from "@game/systems/CoinSystem";
import { WaveSystem } from "@game/systems/WaveSystem";
import { HUD } from "@game/ui/HUD";
import { WeaponPickupButton } from "@game/ui/WeaponPickupButton";
import { Shop } from "@game/ui/Shop";
import { StartScreen } from "@game/ui/StartScreen";
import { GameOverScreen } from "@game/ui/GameOverScreen";
import { VictoryScreen } from "@game/ui/VictoryScreen";
import { WaveAnnouncement } from "@game/ui/WaveAnnouncement";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";

function GameScene() {
  const playerRef = useRef<THREE.Group>(null);
  const enemyManagerRef = useRef<EnemyManagerHandle>(null);

  const handleEnemyDeath = useCallback((position: [number, number, number]) => {
    useEconomyStore.getState().queueCoinSpawn(position);
  }, []);

  const handleHit = useCallback((_position: [number, number, number], _damage: number) => {
    // Hit effects can be added later
  }, []);

  return (
    <>
      <Forest />
      <Player ref={playerRef} />
      <EnemyManager
        ref={enemyManagerRef}
        playerRef={playerRef}
        onEnemyDeath={handleEnemyDeath}
      />
      <CombatSystem
        playerRef={playerRef}
        enemyManagerRef={enemyManagerRef}
        onHit={handleHit}
      />
      <CoinSystem playerRef={playerRef} />
      <WaveSystem enemyManagerRef={enemyManagerRef} />
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
      {gameStarted && !gameOver && !isVictory && <Shop />}
      {gameOver && !isVictory && <GameOverScreen />}
      {isVictory && <VictoryScreen />}
      {announcement && <WaveAnnouncement text={announcement} />}
    </>
  );
}
