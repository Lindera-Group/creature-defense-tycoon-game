import { useEffect } from "react";
import { useHotbarStore } from "@game/stores/hotbarStore";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { WEAPONS } from "@shared/constants";
import type { WeaponType } from "@shared/types";

// Abbreviate a snake_case item name to up to 4 chars
function abbreviate(itemType: string): string {
  const overrides: Record<string, string> = {
    bat: "BAT",
    spiked_bat: "SPBT",
    crossbow: "XBOW",
    shotgun: "SHOT",
    rifle: "RIFL",
    minigun: "MINI",
    rocket_launcher: "RKET",
    silver_sword: "SLVR",
    holy_crossbow: "HOLY",
    magic_staff: "MGIC",
    basic_turret: "BTUR",
    laser_turret: "LASR",
    artillery: "ARTL",
    silver_turret: "STVR",
    holy_cannon: "HCNN",
    wooden_fence: "WFNC",
    stone_wall: "STNE",
    watchtower: "WTWR",
    fort: "FORT",
    castle: "CSTL",
    mega_fortress: "MEGA",
  };
  if (overrides[itemType]) return overrides[itemType];
  // Fallback: first 4 chars uppercase
  return itemType.replace(/_/g, "").slice(0, 4).toUpperCase();
}

export function Hotbar() {
  const slots = useHotbarStore((s) => s.slots);
  const selectedIndex = useHotbarStore((s) => s.selectedIndex);
  const hammerActive = useHotbarStore((s) => s.hammerActive);
  const selectSlot = useHotbarStore((s) => s.selectSlot);
  const toggleHammer = useHotbarStore((s) => s.toggleHammer);

  // Keyboard: 1-9 select slots, H toggles hammer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < slots.length) {
          useHotbarStore.getState().selectSlot(idx);
          const slot = useHotbarStore.getState().slots[idx];
          if (!slot) return;
          if (slot.type === "weapon") {
            useGameStore.getState().equipWeapon(slot.itemType as WeaponType);
          } else if (slot.type === "blueprint" && slot.category) {
            useBuildingStore.getState().startPlacing(slot.itemType, slot.category);
          }
        }
      }

      if (e.key === "h" || e.key === "H") {
        toggleHammer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slots.length, toggleHammer]);

  const handleSlotClick = (index: number) => {
    selectSlot(index);
    const slot = slots[index];
    if (!slot) return;
    if (slot.type === "weapon") {
      useGameStore.getState().equipWeapon(slot.itemType as WeaponType);
    } else if (slot.type === "blueprint" && slot.category) {
      useBuildingStore.getState().startPlacing(slot.itemType, slot.category);
    }
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20
        flex items-center gap-1 px-3 py-2
        bg-black/70 border-2 border-black rounded-xl
        backdrop-blur-sm shadow-[0_4px_0_rgb(0,0,0)]"
    >
      {slots.map((slot, index) => {
        const isSelected = selectedIndex === index;
        const isWeapon = slot.type === "weapon";
        const isRanged = isWeapon && WEAPONS[slot.itemType as WeaponType]?.isRanged;

        return (
          <button
            key={`${slot.type}-${slot.itemType}-${index}`}
            onClick={() => handleSlotClick(index)}
            className={`
              relative w-12 h-12 rounded-lg
              flex flex-col items-center justify-center
              border-2 transition-all duration-100
              font-black text-xs tracking-wider
              ${
                isSelected
                  ? "border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] bg-yellow-400/20 scale-110"
                  : "border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10"
              }
              ${isWeapon ? (isRanged ? "text-red-300" : "text-orange-300") : "text-blue-300"}
            `}
            title={slot.itemType.replace(/_/g, " ")}
          >
            {/* Slot number */}
            <span
              className="absolute top-0.5 left-1 text-white/50 leading-none"
              style={{ fontSize: "9px" }}
            >
              {index + 1}
            </span>

            {/* Item abbreviation */}
            <span style={{ fontSize: "11px" }}>{abbreviate(slot.itemType)}</span>

            {/* Type indicator dot */}
            <span
              className={`w-1 h-1 rounded-full mt-0.5 ${
                isWeapon
                  ? isRanged
                    ? "bg-red-400"
                    : "bg-orange-400"
                  : "bg-blue-400"
              }`}
            />
          </button>
        );
      })}

      {/* Hammer button */}
      {slots.length > 0 && (
        <>
          <div className="w-px h-8 bg-white/20 mx-1" />
          <button
            onClick={toggleHammer}
            className={`
              relative w-12 h-12 rounded-lg
              flex flex-col items-center justify-center
              border-2 transition-all duration-100
              font-black text-lg
              ${
                hammerActive
                  ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] bg-amber-400/20 scale-110"
                  : "border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10"
              }
            `}
            title="Hammer (H) — pick up placed buildings"
          >
            <span className="absolute top-0.5 left-1 text-white/50 leading-none" style={{ fontSize: "9px" }}>H</span>
            <span>🔨</span>
          </button>
        </>
      )}
    </div>
  );
}
