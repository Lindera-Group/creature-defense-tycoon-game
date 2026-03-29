import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useCombatStore } from "@game/stores/combatStore";
import { useBuildingStore } from "@game/stores/buildingStore";
import { PHASE_CONFIG } from "@shared/constants";

const PHASE_NAMES: Record<number, string> = {
  0: "Dark Forest",
  1: "Full Moon Forest",
  2: "Cursed Forest",
  3: "Blood Moon Forest",
};

export function VictoryScreen() {
  const coins = useEconomyStore((s) => s.coins);
  const phase = useGameStore((s) => s.phase);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetEconomy = useEconomyStore((s) => s.reset);
  const resetCombat = useCombatStore((s) => s.reset);
  const resetBuildings = useBuildingStore((s) => s.resetBuildings);

  const isLastPhase = phase === 3;
  const nextPhaseName = !isLastPhase ? PHASE_NAMES[phase + 1] : "";
  const nextCoinMultiplier = !isLastPhase ? PHASE_CONFIG[((phase + 1) as 1 | 2 | 3)].coinMultiplier : 1;

  const handlePlayAgain = () => {
    resetGame();
    resetEconomy();
    resetCombat();
    resetBuildings();
  };

  const handleRebirth = () => {
    // Rebirth: keep coins and weapons, reset buildings and game state
    useGameStore.getState().rebirth();
    useBuildingStore.getState().resetBuildings();
    // Economy (coins) intentionally NOT reset — coins carry over
  };

  if (isLastPhase) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40">
        <div className="text-center max-w-lg px-6">
          <h1 className="text-red-400 text-5xl font-bold mb-3 drop-shadow-lg">
            BLOOD MOON VANQUISHED!
          </h1>
          <p className="text-yellow-300 text-2xl font-bold mb-2">
            CONGRATULATIONS!
          </p>
          <p className="text-white/90 text-lg mb-2">
            You have completed all four phases.
          </p>
          <p className="text-white/70 text-base mb-6">
            The forest is at peace... for now.
          </p>
          <p className="text-yellow-300 text-lg mb-8">
            Final coins: {coins}
          </p>
          <button
            onClick={handlePlayAgain}
            className="bg-gradient-to-b from-yellow-400 to-orange-500 text-white
              font-bold text-xl px-8 py-3 rounded-xl shadow-lg
              hover:from-yellow-300 hover:to-orange-400 active:scale-95
              transition-all duration-150"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-yellow-400 text-6xl font-bold mb-4 drop-shadow-lg">
          YOU WIN!
        </h1>
        <p className="text-white/80 text-xl mb-1">
          All 30 waves defeated!
        </p>
        <p className="text-yellow-300 text-lg mb-6">
          Coins: {coins}
        </p>

        {/* Rebirth offer */}
        <div className="bg-black/40 border border-yellow-500/50 rounded-xl px-6 py-5 mb-6">
          <p className="text-yellow-300 text-2xl font-bold mb-2">
            REBIRTH?
          </p>
          <p className="text-white/80 text-base mb-1">
            Enter <span className="text-yellow-300 font-semibold">{nextPhaseName}</span>
          </p>
          <p className="text-white/60 text-sm mb-3">
            New enemies await. Coins earned: {nextCoinMultiplier}x per kill.
          </p>
          <ul className="text-white/70 text-sm text-left space-y-1 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">+</span>
              Your weapons carry over
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">+</span>
              Your coins carry over
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">-</span>
              Buildings are lost (rebuild stronger)
            </li>
          </ul>
          <button
            onClick={handleRebirth}
            className="w-full bg-gradient-to-b from-purple-500 to-indigo-700 text-white
              font-bold text-xl px-8 py-3 rounded-xl shadow-lg
              hover:from-purple-400 hover:to-indigo-600 active:scale-95
              transition-all duration-150"
          >
            Enter {nextPhaseName}
          </button>
        </div>

        <button
          onClick={handlePlayAgain}
          className="text-white/40 text-sm underline hover:text-white/70 transition-colors"
        >
          Start over instead
        </button>
      </div>
    </div>
  );
}
