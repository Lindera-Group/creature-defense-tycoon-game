import { useState, useRef, useCallback } from "react";
import { useEconomyStore } from "@game/stores/economyStore";
import { useGameStore } from "@game/stores/gameStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { useHotbarStore } from "@game/stores/hotbarStore";
import { WEAPONS, TURRETS, FORTIFICATIONS } from "@shared/constants";
import type { WeaponType, TurretType, FortificationType } from "@shared/types";

type ShopTab = "weapons" | "defenses";

// Helper to format item names (spiked_bat -> Spiked Bat)
function formatItemName(itemType: string): string {
  return itemType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Shop() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShopTab>("weapons");

  // Persist scroll positions across tab switches and open/close
  const scrollPositions = useRef<Record<ShopTab, number>>({ weapons: 0, defenses: 0 });
  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Restore saved scroll position
        node.scrollTop = scrollPositions.current[activeTab];
        // Save on scroll
        const onScroll = () => { scrollPositions.current[activeTab] = node.scrollTop; };
        node.addEventListener("scroll", onScroll);
        return () => node.removeEventListener("scroll", onScroll);
      }
    },
    [activeTab],
  );

  const coins = useEconomyStore((s) => s.coins);
  const buyWeapon = useEconomyStore((s) => s.buyWeapon);
  const buyTurret = useEconomyStore((s) => s.buyTurret);
  const buyFortification = useEconomyStore((s) => s.buyFortification);

  const ownedWeapons = useGameStore((s) => s.ownedWeapons);
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const phase = useGameStore((s) => s.phase);

  const placedTurrets = useBuildingStore((s) => s.placedTurrets);

  // Filter current phase weapons (exclude free "bat")
  const availableWeapons = Object.entries(WEAPONS)
    .filter(([key, config]) => config.unlockedAtPhase <= phase && key !== "bat")
    .map(([key, config]) => ({ weaponType: key as WeaponType, ...config }))
    .sort((a, b) => a.cost - b.cost);

  // Filter current phase turrets
  const availableTurrets = Object.entries(TURRETS)
    .filter(([, config]) => config.unlockedAtPhase <= phase)
    .map(([key, config]) => ({ turretType: key as TurretType, ...config }))
    .sort((a, b) => a.cost - b.cost);

  // Filter current phase fortifications
  const availableFortifications = Object.entries(FORTIFICATIONS)
    .filter(([, config]) => config.unlockedAtPhase <= phase)
    .map(([key, config]) => ({ fortType: key as FortificationType, ...config }))
    .sort((a, b) => a.cost - b.cost);

  const maxTurrets = 10;
  const canPlaceMoreTurrets = placedTurrets.length < maxTurrets;

  return (
    <>
      {/* Toggle button - comic book style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 z-20
          bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500
          hover:from-amber-300 hover:via-yellow-400 hover:to-orange-400
          active:scale-95
          text-black font-black px-6 py-3 rounded-xl
          shadow-[0_6px_0_rgb(180,83,9)] hover:shadow-[0_4px_0_rgb(180,83,9)]
          hover:translate-y-[2px]
          border-4 border-black
          transition-all duration-100
          text-lg tracking-wider
          overflow-hidden"
        style={{
          textShadow: "2px 2px 0px rgba(255,255,255,0.3)",
        }}
      >
        <span className="relative z-10">{isOpen ? "✕ CLOSE" : "🛒 SHOP"}</span>
        {/* Comic book halftone effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, black 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      </button>

      {/* Shop panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-20
            bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95
            backdrop-blur-md
            rounded-2xl p-5 w-80
            border-4 border-black
            shadow-[0_8px_0_rgb(0,0,0),0_8px_20px_rgba(0,0,0,0.5)]
            animate-slideUp"
          style={{
            maxHeight: "calc(100vh - 180px)",
          }}
        >
          {/* Header */}
          <div className="mb-3 pb-3 border-b-4 border-white/20">
            <h2
              className="text-white font-black text-2xl tracking-wider mb-1"
              style={{
                textShadow:
                  "3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)",
                fontFamily: "Impact, sans-serif",
              }}
            >
              SHOP
            </h2>
            <div className="flex items-center gap-2 text-yellow-300">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-lg">{coins} COINS</span>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("weapons")}
              className={`
                flex-1 py-2.5 rounded-lg font-black text-sm tracking-wider
                transition-all duration-200 border-2 border-black
                ${
                  activeTab === "weapons"
                    ? "bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-[0_4px_0_rgb(127,29,29)] border-b-4 border-b-red-800"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 text-white/60 hover:text-white/80"
                }
              `}
              style={
                activeTab === "weapons"
                  ? { textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }
                  : {}
              }
            >
              ⚔️ WEAPONS
            </button>
            <button
              onClick={() => setActiveTab("defenses")}
              className={`
                flex-1 py-2.5 rounded-lg font-black text-sm tracking-wider
                transition-all duration-200 border-2 border-black
                ${
                  activeTab === "defenses"
                    ? "bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-[0_4px_0_rgb(30,58,138)] border-b-4 border-b-indigo-800"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 text-white/60 hover:text-white/80"
                }
              `}
              style={
                activeTab === "defenses"
                  ? { textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }
                  : {}
              }
            >
              🏰 DEFENSES
            </button>
          </div>

          {/* Content - Weapons or Defenses */}
          {activeTab === "weapons" ? (
            /* Weapons list */
            <div
              ref={scrollRef}
              className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
              style={{ maxHeight: "calc(100vh - 360px)" }}
            >
              {availableWeapons.map(({ weaponType, cost, damage, attackSpeed, range, isRanged, unlockedAtPhase }) => {
                const owned = ownedWeapons.includes(weaponType);
                const equipped = equippedWeapon === weaponType;
                const canAfford = coins >= cost;
                const isPhaseLocked = unlockedAtPhase > phase;

                return (
                  <div
                    key={weaponType}
                    className={`
                      relative rounded-xl p-3 border-2 transition-all duration-200
                      ${
                        isPhaseLocked
                          ? "bg-gradient-to-br from-gray-900/70 to-black/70 border-gray-700/50 opacity-50"
                          : equipped
                            ? "bg-gradient-to-br from-green-500/30 via-emerald-500/30 to-teal-500/30 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                            : owned
                              ? "bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border-blue-400/50"
                              : canAfford
                                ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40 hover:bg-white/15"
                                : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30 opacity-60"
                      }
                    `}
                  >
                    {/* Phase lock badge */}
                    {isPhaseLocked && (
                      <div
                        className="absolute -top-2 -right-2 bg-gray-800 text-yellow-300
                        font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-600
                        shadow-lg"
                      >
                        🔒 PHASE {unlockedAtPhase}
                      </div>
                    )}

                    {/* Equipped badge */}
                    {equipped && !isPhaseLocked && (
                      <div
                        className="absolute -top-2 -right-2 bg-green-500 text-black
                        font-black text-xs px-2 py-1 rounded-lg border-2 border-black
                        shadow-lg animate-pulse"
                      >
                        ⚡ EQUIPPED
                      </div>
                    )}

                    {/* Weapon header */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="text-white font-black text-base tracking-wide"
                          style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                        >
                          {formatItemName(weaponType)}
                        </h3>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isRanged
                              ? "bg-red-500/80 text-white"
                              : "bg-orange-500/80 text-white"
                          }`}
                        >
                          {isRanged ? "🎯 RANGED" : "⚔️ MELEE"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-yellow-300 font-black text-lg"
                          style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                        >
                          {cost}
                        </div>
                        <div className="text-yellow-500/80 text-xs font-bold">
                          COINS
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                        <div className="text-red-400 font-black text-lg">
                          {damage}
                        </div>
                        <div className="text-white/60 text-[10px] font-bold uppercase">
                          Damage
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                        <div className="text-blue-400 font-black text-lg">
                          {attackSpeed.toFixed(1)}
                        </div>
                        <div className="text-white/60 text-[10px] font-bold uppercase">
                          Speed
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                        <div className="text-purple-400 font-black text-lg">
                          {range.toFixed(0)}m
                        </div>
                        <div className="text-white/60 text-[10px] font-bold uppercase">
                          Range
                        </div>
                      </div>
                    </div>

                    {/* Buy button */}
                    <button
                      onClick={() => {
                        if (buyWeapon(weaponType)) {
                          useHotbarStore.getState().addWeaponSlot(weaponType);
                        }
                      }}
                      disabled={owned || !canAfford || isPhaseLocked}
                      className={`
                        w-full py-2.5 rounded-lg font-black text-sm tracking-wider
                        transition-all duration-100 border-2 border-black
                        ${
                          isPhaseLocked
                            ? "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                            : owned
                              ? "bg-gray-600 text-white/50 cursor-not-allowed shadow-none"
                              : canAfford
                                ? "bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-300 hover:to-emerald-500 text-black shadow-[0_4px_0_rgb(5,150,105)] hover:shadow-[0_2px_0_rgb(5,150,105)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                                : "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                        }
                      `}
                      style={
                        canAfford && !owned && !isPhaseLocked
                          ? { textShadow: "1px 1px 0px rgba(255,255,255,0.3)" }
                          : {}
                      }
                    >
                      {isPhaseLocked ? "🔒 PHASE LOCKED" : owned ? "✓ OWNED" : canAfford ? "💰 BUY NOW" : "🔒 NOT ENOUGH COINS"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Defenses list */
            <div
              ref={scrollRef}
              className="space-y-4 overflow-y-auto pr-2 custom-scrollbar"
              style={{ maxHeight: "calc(100vh - 360px)" }}
            >
              {/* Turrets section */}
              {availableTurrets.length > 0 && (
                <div>
                  <h3
                    className="text-cyan-300 font-black text-sm tracking-wider mb-2 uppercase"
                    style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                  >
                    🔫 Turrets ({placedTurrets.length}/{maxTurrets})
                  </h3>
                  <div className="space-y-3">
                    {availableTurrets.map(({ turretType, cost, damage, attackSpeed, range, unlockedAtPhase }) => {
                      const canAfford = coins >= cost;
                      const isPhaseLocked = unlockedAtPhase > phase;
                      const canPlace = canPlaceMoreTurrets && !isPhaseLocked;

                      return (
                        <div
                          key={turretType}
                          className={`
                            relative rounded-xl p-3 border-2 transition-all duration-200
                            ${
                              isPhaseLocked
                                ? "bg-gradient-to-br from-gray-900/70 to-black/70 border-gray-700/50 opacity-50"
                                : canAfford && canPlace
                                  ? "bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-900/40"
                                  : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30 opacity-60"
                            }
                          `}
                        >
                          {/* Phase lock badge */}
                          {isPhaseLocked && (
                            <div
                              className="absolute -top-2 -right-2 bg-gray-800 text-yellow-300
                              font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-600
                              shadow-lg"
                            >
                              🔒 PHASE {unlockedAtPhase}
                            </div>
                          )}

                          {/* Turret header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3
                                className="text-white font-black text-base tracking-wide"
                                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                              >
                                {formatItemName(turretType)}
                              </h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/80 text-white">
                                🔫 AUTO-FIRE
                              </span>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-yellow-300 font-black text-lg"
                                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                              >
                                {cost}
                              </div>
                              <div className="text-yellow-500/80 text-xs font-bold">
                                COINS
                              </div>
                            </div>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                            <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                              <div className="text-red-400 font-black text-lg">
                                {damage}
                              </div>
                              <div className="text-white/60 text-[10px] font-bold uppercase">
                                Damage
                              </div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                              <div className="text-blue-400 font-black text-lg">
                                {attackSpeed.toFixed(1)}
                              </div>
                              <div className="text-white/60 text-[10px] font-bold uppercase">
                                Speed
                              </div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                              <div className="text-purple-400 font-black text-lg">
                                {range}m
                              </div>
                              <div className="text-white/60 text-[10px] font-bold uppercase">
                                Range
                              </div>
                            </div>
                          </div>

                          {/* Buy & Place button */}
                          <button
                            onClick={() => {
                              if (buyTurret(turretType)) {
                                useHotbarStore.getState().addBlueprint(turretType, "turret");
                              }
                            }}
                            disabled={!canAfford || !canPlace}
                            className={`
                              w-full py-2.5 rounded-lg font-black text-sm tracking-wider
                              transition-all duration-100 border-2 border-black
                              ${
                                isPhaseLocked
                                  ? "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                                  : !canPlaceMoreTurrets
                                    ? "bg-red-700 text-white/70 cursor-not-allowed shadow-none"
                                    : canAfford
                                      ? "bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black shadow-[0_4px_0_rgb(30,58,138)] hover:shadow-[0_2px_0_rgb(30,58,138)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                                      : "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                              }
                            `}
                            style={
                              canAfford && canPlace
                                ? { textShadow: "1px 1px 0px rgba(255,255,255,0.3)" }
                                : {}
                            }
                          >
                            {isPhaseLocked
                              ? "🔒 PHASE LOCKED"
                              : !canPlaceMoreTurrets
                                ? "❌ MAX TURRETS"
                                : canAfford
                                  ? "🏗️ BUY & PLACE"
                                  : "🔒 NOT ENOUGH COINS"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fortifications section */}
              {availableFortifications.length > 0 && (
                <div>
                  <h3
                    className="text-orange-300 font-black text-sm tracking-wider mb-2 uppercase"
                    style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                  >
                    🏰 Fortifications
                  </h3>
                  <div className="space-y-3">
                    {availableFortifications.map(({ fortType, cost, health, unlockedAtPhase }) => {
                      const canAfford = coins >= cost;
                      const isPhaseLocked = unlockedAtPhase > phase;

                      return (
                        <div
                          key={fortType}
                          className={`
                            relative rounded-xl p-3 border-2 transition-all duration-200
                            ${
                              isPhaseLocked
                                ? "bg-gradient-to-br from-gray-900/70 to-black/70 border-gray-700/50 opacity-50"
                                : canAfford
                                  ? "bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400/30 hover:border-orange-400/60 hover:bg-orange-900/40"
                                  : "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30 opacity-60"
                            }
                          `}
                        >
                          {/* Phase lock badge */}
                          {isPhaseLocked && (
                            <div
                              className="absolute -top-2 -right-2 bg-gray-800 text-yellow-300
                              font-black text-xs px-2 py-1 rounded-lg border-2 border-gray-600
                              shadow-lg"
                            >
                              🔒 PHASE {unlockedAtPhase}
                            </div>
                          )}

                          {/* Fortification header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3
                                className="text-white font-black text-base tracking-wide"
                                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                              >
                                {formatItemName(fortType)}
                              </h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/80 text-white">
                                🛡️ DEFENSE
                              </span>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-yellow-300 font-black text-lg"
                                style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
                              >
                                {cost}
                              </div>
                              <div className="text-yellow-500/80 text-xs font-bold">
                                COINS
                              </div>
                            </div>
                          </div>

                          {/* Health stat */}
                          <div className="bg-black/30 rounded-lg p-2 mb-3 border border-white/10 text-center">
                            <div className="text-green-400 font-black text-2xl">
                              {health}
                            </div>
                            <div className="text-white/60 text-xs font-bold uppercase">
                              Health Points
                            </div>
                          </div>

                          {/* Buy & Place button */}
                          <button
                            onClick={() => {
                              if (buyFortification(fortType)) {
                                useHotbarStore.getState().addBlueprint(fortType, "fortification");
                              }
                            }}
                            disabled={!canAfford || isPhaseLocked}
                            className={`
                              w-full py-2.5 rounded-lg font-black text-sm tracking-wider
                              transition-all duration-100 border-2 border-black
                              ${
                                isPhaseLocked
                                  ? "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                                  : canAfford
                                    ? "bg-gradient-to-br from-orange-400 to-red-600 hover:from-orange-300 hover:to-red-500 text-black shadow-[0_4px_0_rgb(127,29,29)] hover:shadow-[0_2px_0_rgb(127,29,29)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                                    : "bg-gray-700 text-white/30 cursor-not-allowed shadow-none"
                              }
                            `}
                            style={
                              canAfford && !isPhaseLocked
                                ? { textShadow: "1px 1px 0px rgba(255,255,255,0.3)" }
                                : {}
                            }
                          >
                            {isPhaseLocked
                              ? "🔒 PHASE LOCKED"
                              : canAfford
                                ? "🏗️ BUY & PLACE"
                                : "🔒 NOT ENOUGH COINS"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fcd34d, #fbbf24);
        }
      `}</style>
    </>
  );
}
