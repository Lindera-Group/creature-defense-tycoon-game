import { useEconomyStore } from "@game/stores/economyStore";
import { useEffect, useRef, useState } from "react";

export function CoinCounter() {
  const coins = useEconomyStore((s) => s.coins);
  const previousCoins = useRef(coins);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    // Only trigger animation if coins increased
    if (coins > previousCoins.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      previousCoins.current = coins;
      return () => clearTimeout(timer);
    }
    previousCoins.current = coins;
  }, [coins]);

  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-yellow-400 text-lg transition-all duration-300 ${
          isBouncing ? "animate-bounce-in" : ""
        }`}
      >
        &#9679;
      </span>
      <span
        className={`font-bold text-lg drop-shadow transition-all duration-300 ${
          isBouncing
            ? "animate-bounce-in text-game-gold scale-110"
            : "text-yellow-300"
        }`}
      >
        {coins}
      </span>
    </div>
  );
}
