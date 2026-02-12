import { useGameStore } from "@game/stores/gameStore";
import { HealthBar } from "./HealthBar";
import { CoinCounter } from "./CoinCounter";
import { WaveIndicator } from "./WaveIndicator";
import { WEAPONS } from "@shared/constants";

export function HUD() {
  const equippedWeapon = useGameStore((s) => s.equippedWeapon);
  const weaponName = equippedWeapon
    ? WEAPONS[equippedWeapon]?.type.replace("_", " ") ?? ""
    : "None";

  return (
    <div className="fixed inset-x-0 top-0 p-3 pointer-events-none z-10">
      <div className="flex justify-between items-start">
        {/* Top-left: Health */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <HealthBar />
        </div>

        {/* Top-center: Wave */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
          <WaveIndicator />
        </div>

        {/* Top-right: Coins */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <CoinCounter />
        </div>
      </div>

      {/* Bottom-left: Equipped weapon */}
      <div className="fixed bottom-3 left-3 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
        <span className="text-white/70 text-xs">Weapon: </span>
        <span className="text-white font-bold text-sm capitalize">
          {weaponName}
        </span>
      </div>
    </div>
  );
}
