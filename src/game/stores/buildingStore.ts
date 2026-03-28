import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TurretType, FortificationType, PlacedTurret, PlacedFortification } from "@shared/types";
import { TURRETS, FORTIFICATIONS } from "@shared/constants";

const MAX_TURRETS = 10;

interface BuildingStoreState {
  placedTurrets: PlacedTurret[];
  placedFortifications: PlacedFortification[];
  isPlacing: boolean;
  placingType: string | null;
  placingCategory: "turret" | "fortification" | null;
}

interface BuildingStoreActions {
  startPlacing: (type: string, category: "turret" | "fortification") => void;
  cancelPlacing: () => void;
  placeTurret: (type: TurretType, position: [number, number, number], rotation?: number) => boolean;
  placeFortification: (type: FortificationType, position: [number, number, number], rotation?: number) => void;
  removeTurret: (id: string) => void;
  removeFortification: (id: string) => void;
  damageTurret: (id: string, amount: number) => void;
  damageFortification: (id: string, amount: number) => void;
  resetBuildings: () => void;
}

let nextTurretId = 0;
let nextFortId = 0;

const initialState: BuildingStoreState = {
  placedTurrets: [],
  placedFortifications: [],
  isPlacing: false,
  placingType: null,
  placingCategory: null,
};

export const useBuildingStore = create<BuildingStoreState & BuildingStoreActions>()(
  immer((set, get) => ({
    ...initialState,

    startPlacing: (type, category) =>
      set((state) => {
        state.isPlacing = true;
        state.placingType = type;
        state.placingCategory = category;
      }),

    cancelPlacing: () =>
      set((state) => {
        state.isPlacing = false;
        state.placingType = null;
        state.placingCategory = null;
      }),

    placeTurret: (type, position, rotation = 0) => {
      if (get().placedTurrets.length >= MAX_TURRETS) return false;
      const config = TURRETS[type];
      if (!config) return false;
      set((state) => {
        state.placedTurrets.push({
          id: `turret_${nextTurretId++}`,
          type,
          position,
          health: 200, // base turret health
          rotation,
        });
      });
      return true;
    },

    placeFortification: (type, position, rotation = 0) => {
      const config = FORTIFICATIONS[type];
      if (!config) return;
      set((state) => {
        state.placedFortifications.push({
          id: `fort_${nextFortId++}`,
          type,
          position,
          health: config.health,
          rotation,
        });
      });
    },

    removeTurret: (id) =>
      set((state) => {
        state.placedTurrets = state.placedTurrets.filter((t) => t.id !== id);
      }),

    removeFortification: (id) =>
      set((state) => {
        state.placedFortifications = state.placedFortifications.filter((f) => f.id !== id);
      }),

    damageTurret: (id, amount) =>
      set((state) => {
        const turret = state.placedTurrets.find((t) => t.id === id);
        if (!turret) return;
        turret.health = Math.max(0, turret.health - amount);
        if (turret.health <= 0) {
          state.placedTurrets = state.placedTurrets.filter((t) => t.id !== id);
        }
      }),

    damageFortification: (id, amount) =>
      set((state) => {
        const fort = state.placedFortifications.find((f) => f.id === id);
        if (!fort) return;
        fort.health = Math.max(0, fort.health - amount);
        if (fort.health <= 0) {
          state.placedFortifications = state.placedFortifications.filter((f) => f.id !== id);
        }
      }),

    resetBuildings: () => {
      nextTurretId = 0;
      nextFortId = 0;
      set(() => ({ ...initialState }));
    },
  })),
);
