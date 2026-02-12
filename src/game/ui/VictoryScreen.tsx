import { useGameStore } from "@game/stores/gameStore";
import { useEconomyStore } from "@game/stores/economyStore";
import { useCombatStore } from "@game/stores/combatStore";

export function VictoryScreen() {
  const coins = useEconomyStore((s) => s.coins);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetEconomy = useEconomyStore((s) => s.reset);
  const resetCombat = useCombatStore((s) => s.reset);

  const handlePlayAgain = () => {
    resetGame();
    resetEconomy();
    resetCombat();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <div className="text-center">
        <h1 className="text-yellow-400 text-6xl font-bold mb-4 drop-shadow-lg">
          YOU WIN!
        </h1>
        <p className="text-white/80 text-xl mb-1">
          All waves defeated!
        </p>
        <p className="text-yellow-300 text-lg mb-6">
          Final coins: {coins}
        </p>
        <p className="text-white/50 text-sm mb-8 italic">
          More phases coming soon... Full Moon awaits!
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
