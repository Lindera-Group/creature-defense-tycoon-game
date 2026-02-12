export function getHealthBarColor(health: number, maxHealth: number): string {
  const pct = (health / maxHealth) * 100;
  if (pct > 50) return "#4CAF50";
  if (pct >= 25) return "#FFC107";
  return "#F44336";
}

export function getHealthBarWidth(health: number, maxHealth: number): string {
  const pct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  return `${pct}%`;
}

export function formatWaveText(wave: number, gameStarted: boolean): string {
  if (!gameStarted) return "";
  if (wave === 0) return "Get Ready!";
  return `Wave ${wave}`;
}
