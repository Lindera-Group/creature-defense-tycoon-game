import { useRef, useCallback, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Coin } from "@game/entities/Coin";
import { useEconomyStore } from "@game/stores/economyStore";
import { ENEMIES } from "@shared/constants";

interface CoinDrop {
  id: string;
  position: [number, number, number];
  amount: number;
}

interface CoinSystemProps {
  playerRef: React.RefObject<THREE.Group | null>;
}

export function CoinSystem({ playerRef }: CoinSystemProps) {
  const [coins, setCoins] = useState<CoinDrop[]>([]);
  const addCoins = useEconomyStore((s) => s.addCoins);
  const nextIdRef = useRef(0);

  // Drain pending coin spawns from store each frame
  useFrame(() => {
    const spawns = useEconomyStore.getState().drainCoinSpawns();
    if (spawns.length === 0) return;

    const config = ENEMIES.zombie_green;
    const newCoins: CoinDrop[] = spawns.map((spawn) => ({
      id: `coin-${nextIdRef.current++}`,
      position: spawn.position,
      amount: useEconomyStore.getState().rollCoinDrop(config.coinDrop),
    }));

    setCoins((prev) => [...prev, ...newCoins]);
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
          onCollect={handleCollect}
          playerRef={playerRef}
        />
      ))}
    </>
  );
}
