import type { GridSize } from "./types";

export const SURVIVAL_START_SECONDS = 180;
export const SURVIVAL_LIVES = 3;
export const MISTAKE_PENALTY_SECONDS = 10;
export const PUZZLES_PER_SIZE = 3;
export const POINTS_PER_CELL = 10;

const SIZE_STEPS: GridSize[] = [4, 5, 6, 7];

export const TIME_BONUS_SECONDS: Record<GridSize, number> = { 4: 45, 5: 60, 6: 90, 7: 120 };

export const SPEED_PAR_SECONDS: Record<GridSize, number> = { 4: 60, 5: 120, 6: 180, 7: 300 };

export function sizeForRound(round: number): GridSize {
  return SIZE_STEPS[Math.min(Math.floor(round / PUZZLES_PER_SIZE), SIZE_STEPS.length - 1)];
}

export function pointsForSolve(size: GridSize, solveSeconds: number): number {
  return size * size * POINTS_PER_CELL + Math.max(0, SPEED_PAR_SECONDS[size] - Math.floor(solveSeconds));
}

export interface SurvivalBest {
  score: number;
  solved: number;
}

export function isBetter(candidate: SurvivalBest, best: SurvivalBest | null): boolean {
  if (!best) return candidate.score > 0;
  return candidate.score > best.score || (candidate.score === best.score && candidate.solved > best.solved);
}
