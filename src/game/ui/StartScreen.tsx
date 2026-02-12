export function StartScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start pt-16 pointer-events-none z-10">
      <h1 className="text-yellow-400 text-5xl font-bold drop-shadow-lg mb-2">
        Creature Defense Tycoon
      </h1>
      <p className="text-white/80 text-xl drop-shadow">
        Pick up the bat to start!
      </p>
    </div>
  );
}
