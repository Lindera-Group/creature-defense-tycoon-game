import { useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { WAVE_CONFIGS } from "@shared/waveConfigs";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import type { EnemyManagerHandle } from "@game/entities/EnemyManager";
import { FOREST_CONFIG } from "@game/world/forestHelpers";

type WaveState = "idle" | "spawning" | "active" | "waveComplete" | "interWave" | "allComplete";

interface WaveSystemProps {
  enemyManagerRef: React.RefObject<EnemyManagerHandle | null>;
}

export function WaveSystem({ enemyManagerRef }: WaveSystemProps) {
  const stateRef = useRef<WaveState>("idle");
  const spawnTimerRef = useRef(0);
  const spawnedCountRef = useRef(0);
  const interWaveTimerRef = useRef(0);
  const waveIndexRef = useRef(-1);

  const wave = useGameStore((s) => s.wave);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameOver = useGameStore((s) => s.gameOver);
  const enemiesAlive = useGameStore((s) => s.enemiesAlive);
  const nextWave = useGameStore((s) => s.nextWave);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const setState = useCallback(
    (newState: WaveState) => {
      stateRef.current = newState;
      const store = useGameStore.getState();

      if (newState === "spawning") {
        store.setAnnouncement(`Wave ${store.wave}`);
        setTimeout(() => useGameStore.getState().setAnnouncement(""), 2000);
      } else if (newState === "waveComplete") {
        store.setAnnouncement(`Wave ${store.wave} Complete!`);
        setTimeout(() => useGameStore.getState().setAnnouncement(""), 2000);
      } else if (newState === "allComplete") {
        store.setVictory(true);
      }
    },
    [],
  );

  // Reset wave system when game resets
  useEffect(() => {
    if (!gameStarted && !gameOver) {
      stateRef.current = "idle";
      waveIndexRef.current = -1;
      spawnedCountRef.current = 0;
      spawnTimerRef.current = 0;
      interWaveTimerRef.current = 0;
    }
  }, [gameStarted, gameOver]);

  // Start first wave when game starts
  useEffect(() => {
    if (gameStarted && stateRef.current === "idle" && wave === 1) {
      waveIndexRef.current = 0;
      spawnedCountRef.current = 0;
      spawnTimerRef.current = 0;
      setState("spawning");
    }
  }, [gameStarted, wave, setState]);

  const getSpawnPosition = useCallback((): [number, number, number] => {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = FOREST_CONFIG.clearRadius + 5;
    return [
      Math.cos(angle) * spawnDist,
      0,
      Math.sin(angle) * spawnDist,
    ];
  }, []);

  useFrame((_, delta) => {
    if (!gameStarted || gameOver) return;

    const state = stateRef.current;
    const waveIdx = waveIndexRef.current;
    if (waveIdx < 0 || waveIdx >= WAVE_CONFIGS.length) return;

    const waveConfig = WAVE_CONFIGS[waveIdx];
    const enemyGroup = waveConfig.enemies[0];

    if (state === "spawning") {
      spawnTimerRef.current += delta;

      if (
        spawnTimerRef.current >= enemyGroup.spawnDelay &&
        spawnedCountRef.current < enemyGroup.count
      ) {
        spawnTimerRef.current = 0;
        spawnedCountRef.current++;

        if (enemyManagerRef.current) {
          enemyManagerRef.current.spawnEnemy(getSpawnPosition());
        }

        if (spawnedCountRef.current >= enemyGroup.count) {
          setState("active");
        }
      }
    }

    if (state === "active" && enemiesAlive === 0 && spawnedCountRef.current > 0) {
      addCoins(waveConfig.bonusCoins);
      setState("waveComplete");
      interWaveTimerRef.current = 0;
    }

    if (state === "waveComplete") {
      interWaveTimerRef.current += delta;
      if (interWaveTimerRef.current >= 2) {
        if (waveIdx + 1 >= WAVE_CONFIGS.length) {
          setState("allComplete");
        } else {
          setState("interWave");
          interWaveTimerRef.current = 0;
        }
      }
    }

    if (state === "interWave") {
      interWaveTimerRef.current += delta;
      if (interWaveTimerRef.current >= 3) {
        waveIndexRef.current++;
        spawnedCountRef.current = 0;
        spawnTimerRef.current = 0;
        nextWave();
        setState("spawning");
      }
    }
  });

  return null;
}
