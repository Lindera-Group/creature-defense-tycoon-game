import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface HotbarSlot {
  type: "weapon" | "blueprint";
  itemType: string;
  category?: "turret" | "fortification";
}

interface HotbarState {
  slots: HotbarSlot[];
  selectedIndex: number;
  hammerActive: boolean;
}

interface HotbarActions {
  addWeaponSlot: (weaponType: string) => void;
  addBlueprint: (itemType: string, category: "turret" | "fortification") => void;
  removeSlot: (index: number) => void;
  selectSlot: (index: number) => void;
  toggleHammer: () => void;
  reset: () => void;
}

const initialState: HotbarState = {
  slots: [],
  selectedIndex: -1,
  hammerActive: false,
};

export const useHotbarStore = create<HotbarState & HotbarActions>()(
  immer((set, get) => ({
    ...initialState,

    addWeaponSlot: (weaponType) =>
      set((state) => {
        // Don't add duplicates
        if (state.slots.some((s) => s.type === "weapon" && s.itemType === weaponType)) {
          return;
        }
        // Find last weapon index to insert after it (weapons stay at the start)
        const lastWeaponIdx = state.slots.reduce(
          (acc, slot, idx) => (slot.type === "weapon" ? idx : acc),
          -1,
        );
        const newSlot: HotbarSlot = { type: "weapon", itemType: weaponType };
        state.slots.splice(lastWeaponIdx + 1, 0, newSlot);
        // Auto-select if nothing selected
        if (state.selectedIndex === -1) {
          state.selectedIndex = lastWeaponIdx + 1;
        }
      }),

    addBlueprint: (itemType, category) =>
      set((state) => {
        const newSlot: HotbarSlot = { type: "blueprint", itemType, category };
        state.slots.push(newSlot);
        // Auto-select the newly added blueprint
        state.selectedIndex = state.slots.length - 1;
        state.hammerActive = false;
      }),

    removeSlot: (index) =>
      set((state) => {
        if (index < 0 || index >= state.slots.length) return;
        state.slots.splice(index, 1);
        // Adjust selectedIndex
        if (state.slots.length === 0) {
          state.selectedIndex = -1;
        } else if (state.selectedIndex >= state.slots.length) {
          state.selectedIndex = state.slots.length - 1;
        } else if (state.selectedIndex > index) {
          state.selectedIndex -= 1;
        }
      }),

    selectSlot: (index) =>
      set((state) => {
        state.selectedIndex = index;
        state.hammerActive = false;
      }),

    toggleHammer: () =>
      set((state) => {
        state.hammerActive = !state.hammerActive;
        if (state.hammerActive) {
          state.selectedIndex = -1;
        }
      }),

    reset: () => {
      void get(); // suppress lint
      set(() => ({ ...initialState }));
    },
  })),
);
