import { useState } from "react";
import { useEconomyStore } from "@game/stores/economyStore";
import { useGameStore } from "@game/stores/gameStore";
import { WEAPONS } from "@shared/constants";

export function Shop() {
  const [isOpen, setIsOpen] = useState(false);
  const coins = useEconomyStore((s) => s.coins);
  const buyWeapon = useEconomyStore((s) => s.buyWeapon);
  const ownedWeapons = useGameStore((s) => s.ownedWeapons);

  const spikedBat = WEAPONS.spiked_bat;
  const owned = ownedWeapons.includes("spiked_bat");
  const canAfford = coins >= spikedBat.cost;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-3 right-3 z-20 bg-purple-600 hover:bg-purple-500
          text-white font-bold px-4 py-2 rounded-lg shadow-lg
          transition-colors duration-150"
      >
        {isOpen ? "Close" : "Shop"}
      </button>

      {/* Shop panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-3 z-20 bg-black/80 backdrop-blur-sm
          rounded-xl p-4 w-64 border border-white/10">
          <h2 className="text-white font-bold text-lg mb-3">Shop</h2>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold">Spiked Bat</span>
              <span className="text-yellow-400 font-bold">
                {spikedBat.cost} coins
              </span>
            </div>
            <p className="text-white/60 text-sm mb-3">
              Double the damage! {spikedBat.damage} dmg
            </p>
            <button
              onClick={() => buyWeapon("spiked_bat")}
              disabled={owned || !canAfford}
              className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
                owned
                  ? "bg-gray-600 cursor-not-allowed"
                  : canAfford
                    ? "bg-green-600 hover:bg-green-500 active:bg-green-700"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {owned ? "OWNED" : canAfford ? "BUY" : "Not enough coins"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
