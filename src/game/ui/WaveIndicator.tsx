import { useGameStore } from "@game/stores/gameStore";
import { formatWaveText } from "./hudHelpers";

export function WaveIndicator() {
  const wave = useGameStore((s) => s.wave);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const text = formatWaveText(wave, gameStarted);
  if (!text) return null;

  return (
    <div className="text-white font-bold text-lg drop-shadow text-center">
      {text}
    </div>
  );
}
