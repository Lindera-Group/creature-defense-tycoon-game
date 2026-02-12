import { useGameStore } from "@game/stores/gameStore";
import { getHealthBarColor, getHealthBarWidth } from "./hudHelpers";

export function HealthBar() {
  const health = useGameStore((s) => s.playerHealth);
  const maxHealth = useGameStore((s) => s.playerMaxHealth);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-white drop-shadow">HP</span>
      <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: getHealthBarWidth(health, maxHealth),
            backgroundColor: getHealthBarColor(health, maxHealth),
          }}
        />
      </div>
      <span className="text-xs font-bold text-white drop-shadow">
        {health}/{maxHealth}
      </span>
    </div>
  );
}
