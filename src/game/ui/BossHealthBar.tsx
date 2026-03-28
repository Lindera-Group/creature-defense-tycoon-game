import { useGameStore } from "@game/stores/gameStore";

export function BossHealthBar() {
  const bossHealth = useGameStore((s) => s.bossHealth);
  const bossMaxHealth = useGameStore((s) => s.bossMaxHealth);

  if (bossMaxHealth === 0) return null;

  const healthPercent = Math.max(0, (bossHealth / bossMaxHealth) * 100);

  return (
    <div className="fixed top-20 inset-x-0 flex justify-center z-20 pointer-events-none animate-slide-down">
      <div className="w-full max-w-4xl mx-4">
        {/* Boss Name */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-black text-red-500 drop-shadow-lg tracking-wider uppercase">
            ZOMBIE BOSS
          </h2>
          <div className="h-1 w-32 bg-red-500 mx-auto mt-1"></div>
        </div>

        {/* Health Bar Container */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-lg"></div>

          {/* Main bar */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-lg p-2 border-4 border-red-500/50">
            {/* Inner bar container */}
            <div className="relative h-8 bg-black/80 rounded-md overflow-hidden border-2 border-red-900/50">
              {/* Health fill with gradient */}
              <div
                className="h-full bg-gradient-to-r from-red-700 via-red-500 to-red-600 transition-all duration-500 ease-out relative"
                style={{ width: `${healthPercent}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>

                {/* Pulse effect at the edge */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-300 animate-pulse"></div>
              </div>

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-grid"></div>
            </div>

            {/* Health numbers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white font-black text-xl drop-shadow-lg tracking-wide">
                {Math.ceil(bossHealth)} / {bossMaxHealth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-shine {
          animation: shine 2s infinite linear;
        }

        .bg-grid {
          background-image:
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
