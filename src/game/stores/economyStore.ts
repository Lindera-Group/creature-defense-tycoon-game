import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WeaponType } from "@shared/types";
import { WEAPONS } from "@shared/constants";
import { useGameStore } from "./gameStore";

interface EconomyStoreState {
  coins: number;
}

interface EconomyStoreActions {
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  canAfford: (cost: number) => boolean;
  rollCoinDrop: (range: [min: number, max: number]) => number;
  buyWeapon: (weaponType: WeaponType) => boolean;
  reset: () => void;
}

export const useEconomyStore = create<EconomyStoreState & EconomyStoreActions>()(
  immer((set, get) => ({
    coins: 0,

    addCoins: (amount) =>
      set((state) => {
        state.coins += amount;
      }),

    spendCoins: (amount) => {
      if (get().coins < amount) return false;
      set((state) => {
        state.coins -= amount;
      });
      return true;
    },

    canAfford: (cost) => get().coins >= cost,

    rollCoinDrop: (range) => {
      const [min, max] = range;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    buyWeapon: (weaponType) => {
      const weaponConfig = WEAPONS[weaponType];
      if (!weaponConfig) return false;

      const gameState = useGameStore.getState();
      if (gameState.ownedWeapons.includes(weaponType)) return false;

      if (!get().spendCoins(weaponConfig.cost)) return false;

      gameState.addWeapon(weaponType);
      gameState.equipWeapon(weaponType);
      return true;
    },

    reset: () => set({ coins: 0 }),
  })),
);
