import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WeaponType, RebirthPhase } from "@shared/types";
import { PLAYER_DEFAULTS } from "@shared/constants";

interface GameStoreState {
  phase: RebirthPhase;
  wave: number;
  playerHealth: number;
  playerMaxHealth: number;
  equippedWeapon: WeaponType | null;
  ownedWeapons: WeaponType[];
  enemiesAlive: number;
  bossDefeated: boolean;
  gameStarted: boolean;
  gamePaused: boolean;
  gameOver: boolean;
  isVictory: boolean;
  announcement: string;
  bossHealth: number;
  bossMaxHealth: number;
}

interface GameStoreActions {
  startGame: () => void;
  addWeapon: (weapon: WeaponType) => void;
  equipWeapon: (weapon: WeaponType) => void;
  takeDamage: (amount: number) => void;
  nextWave: () => void;
  setEnemiesAlive: (count: number) => void;
  setVictory: (v: boolean) => void;
  setAnnouncement: (text: string) => void;
  setBossHealth: (health: number, maxHealth: number) => void;
  clearBoss: () => void;
  resetGame: () => void;
}

const initialState: GameStoreState = {
  phase: 0,
  wave: 0,
  playerHealth: PLAYER_DEFAULTS.health,
  playerMaxHealth: PLAYER_DEFAULTS.health,
  equippedWeapon: null,
  ownedWeapons: [],
  enemiesAlive: 0,
  bossDefeated: false,
  gameStarted: false,
  gamePaused: false,
  gameOver: false,
  isVictory: false,
  announcement: "",
  bossHealth: 0,
  bossMaxHealth: 0,
};

export const useGameStore = create<GameStoreState & GameStoreActions>()(
  immer((set) => ({
    ...initialState,

    startGame: () =>
      set((state) => {
        state.gameStarted = true;
        state.wave = 1;
      }),

    addWeapon: (weapon) =>
      set((state) => {
        if (!state.ownedWeapons.includes(weapon)) {
          state.ownedWeapons.push(weapon);
        }
      }),

    equipWeapon: (weapon) =>
      set((state) => {
        if (state.ownedWeapons.includes(weapon)) {
          state.equippedWeapon = weapon;
        }
      }),

    takeDamage: (amount) =>
      set((state) => {
        state.playerHealth = Math.max(0, state.playerHealth - amount);
        if (state.playerHealth === 0) {
          state.gameOver = true;
        }
      }),

    nextWave: () =>
      set((state) => {
        state.wave += 1;
      }),

    setEnemiesAlive: (count) =>
      set((state) => {
        state.enemiesAlive = count;
      }),

    setVictory: (v) =>
      set((state) => {
        state.isVictory = v;
      }),

    setAnnouncement: (text) =>
      set((state) => {
        state.announcement = text;
      }),

    setBossHealth: (health, maxHealth) =>
      set((state) => {
        state.bossHealth = health;
        state.bossMaxHealth = maxHealth;
      }),

    clearBoss: () =>
      set((state) => {
        state.bossHealth = 0;
        state.bossMaxHealth = 0;
      }),

    resetGame: () =>
      set(() => ({ ...initialState, ownedWeapons: [] })),
  })),
);
