import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WeaponConfig } from "@shared/types";
import { WEAPONS } from "@shared/constants";
import { useGameStore } from "./gameStore";

interface HitRecord {
  enemyId: string;
  damage: number;
  timestamp: number;
}

interface CombatStoreState {
  lastAttackTime: number;
  recentHits: HitRecord[];
}

interface CombatStoreActions {
  canAttack: () => boolean;
  performAttack: () => number;
  registerHit: (enemyId: string, damage: number) => void;
  clearHits: () => void;
  getWeaponDamage: () => number;
  getWeaponConfig: () => WeaponConfig | null;
  reset: () => void;
}

export const useCombatStore = create<CombatStoreState & CombatStoreActions>()(
  immer((set, get) => ({
    lastAttackTime: 0,
    recentHits: [],

    canAttack: () => {
      const config = get().getWeaponConfig();
      if (!config) return false;
      const cooldownMs = 1000 / config.attackSpeed;
      return performance.now() - get().lastAttackTime >= cooldownMs;
    },

    performAttack: () => {
      const config = get().getWeaponConfig();
      if (!config) return 0;
      set((state) => {
        state.lastAttackTime = performance.now();
      });
      return config.damage;
    },

    registerHit: (enemyId, damage) =>
      set((state) => {
        state.recentHits.push({
          enemyId,
          damage,
          timestamp: performance.now(),
        });
      }),

    clearHits: () =>
      set((state) => {
        state.recentHits = [];
      }),

    getWeaponDamage: () => {
      const config = get().getWeaponConfig();
      return config?.damage ?? 0;
    },

    getWeaponConfig: () => {
      const { equippedWeapon } = useGameStore.getState();
      if (!equippedWeapon) return null;
      return WEAPONS[equippedWeapon] ?? null;
    },

    reset: () => set({ lastAttackTime: 0, recentHits: [] }),
  })),
);
