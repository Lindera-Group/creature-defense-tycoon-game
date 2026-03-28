import { useRef, useCallback, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Coin } from "@game/entities/Coin";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { ENEMIES } from "@shared/constants";
import { isCoinExpired } from "./coinHelpers";

interface CoinDrop {
  id: string;
  position: [number, number, number];
  amount: number;
  spawnedAt: number; // timestamp in seconds
}

interface CoinSystemProps {
  playerRef: React.RefObject<THREE.Group | null>;
}

export function CoinSystem({ playerRef }: CoinSystemProps) {
  const [coins, setCoins] = useState<CoinDrop[]>([]);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameOver = useGameStore((s) => s.gameOver);
  const nextIdRef = useRef(0);

  // Clear coins on game reset
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      setCoins([]);
      nextIdRef.current = 0;
    }
  }, [gameStarted, gameOver]);

  // Drain pending coin spawns from store each frame
  useFrame((_state, _delta) => {
    const spawns = useEconomyStore.getState().drainCoinSpawns();
    const currentTime = performance.now() / 1000; // convert to seconds

    // Spawn new coins
    if (spawns.length > 0) {
      const newCoins: CoinDrop[] = spawns.map((spawn) => {
        const config = ENEMIES[spawn.enemyType] ?? ENEMIES.zombie_green;
        return {
          id: `coin-${nextIdRef.current++}`,
          position: spawn.position,
          amount: useEconomyStore.getState().rollCoinDrop(config.coinDrop),
          spawnedAt: currentTime,
        };
      });

      setCoins((prev) => [...prev, ...newCoins]);
    }

    // Remove expired coins
    setCoins((prev) => {
      const filtered = prev.filter((coin) => {
        const age = currentTime - coin.spawnedAt;
        return !isCoinExpired(age);
      });
      return filtered.length === prev.length ? prev : filtered;
    });
  });

  const handleCollect = useCallback(
    (coinId: string, amount: number) => {
      addCoins(amount);
      setCoins((prev) => prev.filter((c) => c.id !== coinId));
    },
    [addCoins],
  );

  return (
    <>
      {coins.map((coin) => (
        <Coin
          key={coin.id}
          id={coin.id}
          position={coin.position}
          amount={coin.amount}
          spawnedAt={coin.spawnedAt}
          onCollect={handleCollect}
          playerRef={playerRef}
        />
      ))}
    </>
  );
}
