import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useCombatStore } from "@game/stores/combatStore";

export function GameOverScreen() {
  const resetGame = useGameStore((s) => s.resetGame);
  const resetEconomy = useEconomyStore((s) => s.reset);
  const resetCombat = useCombatStore((s) => s.reset);
  const wave = useGameStore((s) => s.wave);

  const handleRetry = () => {
    resetGame();
    resetEconomy();
    resetCombat();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
      <div className="text-center">
        <h1 className="text-red-500 text-6xl font-bold mb-4 drop-shadow-lg">
          GAME OVER
        </h1>
        <p className="text-white/80 text-xl mb-2">
          You made it to Wave {wave}
        </p>
        <button
          onClick={handleRetry}
          className="mt-6 bg-gradient-to-b from-red-500 to-red-700 text-white
            font-bold text-xl px-8 py-3 rounded-xl shadow-lg
            hover:from-red-400 hover:to-red-600 active:scale-95
            transition-all duration-150"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
