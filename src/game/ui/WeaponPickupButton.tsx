import { useGameStore } from "@game/stores/gameStore";

export function WeaponPickupButton() {
  const ownedWeapons = useGameStore((s) => s.ownedWeapons);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const addWeapon = useGameStore((s) => s.addWeapon);
  const equipWeapon = useGameStore((s) => s.equipWeapon);
  const startGame = useGameStore((s) => s.startGame);

  if (ownedWeapons.length > 0 || gameStarted) return null;

  const handlePickup = () => {
    addWeapon("bat");
    equipWeapon("bat");
    startGame();
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center pb-24 pointer-events-none z-20">
      <button
        onClick={handlePickup}
        className="pointer-events-auto animate-bounce bg-gradient-to-b from-yellow-400 to-orange-500
          text-white font-bold text-2xl px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/50
          hover:from-yellow-300 hover:to-orange-400 hover:scale-105
          active:scale-95 transition-all duration-150
          border-2 border-yellow-300/50"
      >
        Pick Up Bat - FREE!
      </button>
    </div>
  );
}
