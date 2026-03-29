import { HealthBar } from "./HealthBar";
import { CoinCounter } from "./CoinCounter";
import { WaveIndicator } from "./WaveIndicator";

export function HUD() {
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
    </div>
  );
}
