import type { GridSize } from "./types";

export const PAR_SECONDS: Record<GridSize, number> = { 4: 90, 5: 240, 6: 420, 7: 720 };

export const MAX_MISTAKES_FOR_TWO_STARS = 2;

export function starsFor(size: GridSize, mistakes: number, seconds: number, solved: boolean): number {
  if (!solved) return 0;
  if (mistakes === 0 && seconds <= PAR_SECONDS[size]) return 3;
  if (mistakes <= MAX_MISTAKES_FOR_TWO_STARS) return 2;
  return 1;
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
