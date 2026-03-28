import { useBuildingStore } from "@game/stores/buildingStore";
import { TURRETS, FORTIFICATIONS } from "@shared/constants";

/**
 * PlacementHUD - Overlay shown during placement mode
 *
 * Shows instructions and turret count at top-center of screen.
 * "Click to place [item name] | ESC to cancel"
 * "Turrets: X/10" for turrets
 */
export function PlacementHUD() {
  const isPlacing = useBuildingStore((s) => s.isPlacing);
  const placingType = useBuildingStore((s) => s.placingType);
  const placingCategory = useBuildingStore((s) => s.placingCategory);
  const placedTurrets = useBuildingStore((s) => s.placedTurrets);

  if (!isPlacing || !placingType || !placingCategory) return null;

  // Format item name
  const itemName = placingType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Get config to show stats
  const config = placingCategory === "turret"
    ? TURRETS[placingType]
    : FORTIFICATIONS[placingType];

  const isTurret = placingCategory === "turret";
  const turretCount = placedTurrets.length;
  const maxTurrets = 10;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className="bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl
        border-4 border-white/20 shadow-[0_6px_0_rgba(0,0,0,0.5)]
        animate-slideDown"
      >
        {/* Main instruction */}
        <div className="text-center mb-2">
          <span
            className="text-white font-black text-xl tracking-wider"
            style={{
              textShadow: "2px 2px 0px rgba(0,0,0,0.8)",
              fontFamily: "Impact, sans-serif",
            }}
          >
            🏗️ Click to place{" "}
            <span className="text-yellow-300">{itemName}</span>
          </span>
          <span className="text-white/60 font-bold text-sm mx-3">|</span>
          <span className="text-red-400 font-bold text-lg">ESC to cancel</span>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 justify-center items-center text-sm">
          {isTurret && config && "range" in config && (
            <>
              <div className="text-center">
                <span className="text-red-400 font-black">{config.damage}</span>
                <span className="text-white/60 ml-1">DMG</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 font-black">{config.attackSpeed.toFixed(1)}</span>
                <span className="text-white/60 ml-1">SPD</span>
              </div>
              <div className="text-center">
                <span className="text-purple-400 font-black">{config.range}m</span>
                <span className="text-white/60 ml-1">RNG</span>
              </div>
            </>
          )}
          {!isTurret && config && "health" in config && (
            <div className="text-center">
              <span className="text-green-400 font-black">{config.health}</span>
              <span className="text-white/60 ml-1">HP</span>
            </div>
          )}
        </div>

        {/* Turret count */}
        {isTurret && (
          <div className="mt-3 pt-3 border-t-2 border-white/10 text-center">
            <span
              className="text-yellow-300 font-black text-lg"
              style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.8)" }}
            >
              🔫 Turrets: {turretCount}/{maxTurrets}
            </span>
            {turretCount >= maxTurrets && (
              <div className="text-red-400 font-bold text-xs mt-1">
                MAX TURRETS REACHED
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
