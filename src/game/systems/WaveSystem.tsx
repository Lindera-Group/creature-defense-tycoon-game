import { useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { WAVE_CONFIGS } from "@shared/waveConfigs";
import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import type { EnemyManagerHandle } from "@game/entities/EnemyManager";
import { FOREST_CONFIG, getTreePositions } from "@game/world/forestHelpers";
import { getTreeSpawnPosition } from "@game/systems/spawnHelpers";

type WaveState = "idle" | "spawning" | "active" | "waveComplete" | "interWave" | "allComplete";

interface WaveSystemProps {
  enemyManagerRef: React.RefObject<EnemyManagerHandle | null>;
}

export function WaveSystem({ enemyManagerRef }: WaveSystemProps) {
  const stateRef = useRef<WaveState>("idle");
  const spawnTimerRef = useRef(0);
  // Track spawn progress per enemy group: [groupIdx] = count spawned
  const spawnedPerGroupRef = useRef<number[]>([]);
  const currentGroupIdxRef = useRef(0); // round-robin index across groups
  const interWaveTimerRef = useRef(0);
  const waveIndexRef = useRef(-1);
  const announcementTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const wave = useGameStore((s) => s.wave);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const gameOver = useGameStore((s) => s.gameOver);
  const enemiesAlive = useGameStore((s) => s.enemiesAlive);
  const nextWave = useGameStore((s) => s.nextWave);
  const addCoins = useEconomyStore((s) => s.addCoins);

  const clearAnnouncementTimers = useCallback(() => {
    for (const id of announcementTimersRef.current) {
      clearTimeout(id);
    }
    announcementTimersRef.current = [];
  }, []);

  const setState = useCallback(
    (newState: WaveState) => {
      stateRef.current = newState;
      const store = useGameStore.getState();

      if (newState === "spawning") {
        store.setAnnouncement(`Wave ${store.wave}`);
        const id = setTimeout(() => useGameStore.getState().setAnnouncement(""), 2000);
        announcementTimersRef.current.push(id);
      } else if (newState === "waveComplete") {
        store.setAnnouncement(`Wave ${store.wave} Complete!`);
        const id = setTimeout(() => useGameStore.getState().setAnnouncement(""), 2000);
        announcementTimersRef.current.push(id);
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
      spawnedPerGroupRef.current = [];
      currentGroupIdxRef.current = 0;
      spawnTimerRef.current = 0;
      interWaveTimerRef.current = 0;
      clearAnnouncementTimers();
    }
  }, [gameStarted, gameOver, clearAnnouncementTimers]);

  // Start first wave when game starts
  useEffect(() => {
    if (gameStarted && stateRef.current === "idle" && wave === 1) {
      waveIndexRef.current = 0;
      spawnedPerGroupRef.current = [];
      currentGroupIdxRef.current = 0;
      spawnTimerRef.current = 0;
      setState("spawning");
    }
  }, [gameStarted, wave, setState]);

  const getSpawnPosition = useCallback((): [number, number, number] => {
    const trees = getTreePositions();
    return getTreeSpawnPosition(trees, FOREST_CONFIG.clearRadius);
  }, []);

  useFrame((_, delta) => {
    if (!gameStarted || gameOver) return;

    const state = stateRef.current;
    const waveIdx = waveIndexRef.current;
    if (waveIdx < 0 || waveIdx >= WAVE_CONFIGS.length) return;

    const waveConfig = WAVE_CONFIGS[waveIdx];

    if (state === "spawning") {
      spawnTimerRef.current += delta;

      // Initialize spawn tracking for this wave if needed
      if (spawnedPerGroupRef.current.length === 0) {
        spawnedPerGroupRef.current = waveConfig.enemies.map(() => 0);
      }

      // Round-robin: find next group that still has enemies to spawn
      const numGroups = waveConfig.enemies.length;
      let found = false;
      for (let attempt = 0; attempt < numGroups; attempt++) {
        const groupIdx = currentGroupIdxRef.current % numGroups;
        const enemyGroup = waveConfig.enemies[groupIdx];

        if (spawnedPerGroupRef.current[groupIdx] < enemyGroup.count) {
          // This group still has enemies — check spawn timer
          if (spawnTimerRef.current >= enemyGroup.spawnDelay) {
            spawnTimerRef.current = 0;
            spawnedPerGroupRef.current[groupIdx]++;

            if (enemyManagerRef.current) {
              enemyManagerRef.current.spawnEnemy(getSpawnPosition(), enemyGroup.type);
            }

            // Advance to next group for true interleaving
            currentGroupIdxRef.current++;
          }
          found = true;
          break;
        }

        // This group is exhausted, skip to next
        currentGroupIdxRef.current++;
      }

      // If no group has remaining enemies, all spawned
      if (!found) {
        setState("active");
      }
    }

    // Check total spawned for wave completion detection
    const totalSpawned = spawnedPerGroupRef.current.reduce((a, b) => a + b, 0);

    if (state === "active" && enemiesAlive === 0 && totalSpawned > 0) {
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
        spawnedPerGroupRef.current = [];
        currentGroupIdxRef.current = 0;
        spawnTimerRef.current = 0;
        nextWave();
        setState("spawning");
      }
    }
  });

  return null;
}
