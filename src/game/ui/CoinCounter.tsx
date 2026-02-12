import { useEconomyStore } from "@game/stores/economyStore";

export function CoinCounter() {
  const coins = useEconomyStore((s) => s.coins);

  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-lg">&#9679;</span>
      <span className="text-yellow-300 font-bold text-lg drop-shadow">
        {coins}
      </span>
    </div>
  );
}
