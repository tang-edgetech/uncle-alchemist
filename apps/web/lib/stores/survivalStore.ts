import { create } from "zustand";
import {
  MISTAKE_PENALTY_SECONDS,
  pointsForSolve,
  sizeForRound,
  SURVIVAL_LIVES,
  SURVIVAL_START_SECONDS,
  TIME_BONUS_SECONDS,
} from "@/lib/game/survival";

export type SurvivalPhase = "ready" | "playing" | "between" | "over";

export type SurvivalEndReason = "time" | "lives";

export interface SurvivalGain {
  points: number;
  seconds: number;
}

interface SurvivalState {
  phase: SurvivalPhase;
  round: number;
  lives: number;
  timeLeftMs: number;
  score: number;
  solved: number;
  lastGain: SurvivalGain | null;
  endReason: SurvivalEndReason | null;
  reset: () => void;
  begin: () => void;
  tick: (deltaMs: number) => void;
  loseLife: () => void;
  solve: (solveSeconds: number) => void;
  advance: () => void;
}

const MS_PER_SECOND = 1000;

const initialState = {
  phase: "ready" as SurvivalPhase,
  round: 0,
  lives: SURVIVAL_LIVES,
  timeLeftMs: SURVIVAL_START_SECONDS * MS_PER_SECOND,
  score: 0,
  solved: 0,
  lastGain: null,
  endReason: null,
};

export const useSurvivalStore = create<SurvivalState>()((set, get) => ({
  ...initialState,

  reset: () => set(initialState),

  begin: () => set({ ...initialState, phase: "playing" }),

  tick: (deltaMs) => {
    const { phase, timeLeftMs } = get();
    if (phase !== "playing") return;
    const remaining = Math.max(0, timeLeftMs - deltaMs);
    set(remaining === 0 ? { timeLeftMs: 0, phase: "over", endReason: "time" } : { timeLeftMs: remaining });
  },

  loseLife: () => {
    const { phase, lives, timeLeftMs } = get();
    if (phase !== "playing") return;
    const nextLives = lives - 1;
    const remaining = Math.max(0, timeLeftMs - MISTAKE_PENALTY_SECONDS * MS_PER_SECOND);
    if (nextLives <= 0 || remaining === 0) {
      set({ lives: Math.max(0, nextLives), timeLeftMs: remaining, phase: "over", endReason: nextLives <= 0 ? "lives" : "time" });
      return;
    }
    set({ lives: nextLives, timeLeftMs: remaining });
  },

  solve: (solveSeconds) => {
    const { phase, round, score, solved, timeLeftMs } = get();
    if (phase !== "playing") return;
    const size = sizeForRound(round);
    const gain = { points: pointsForSolve(size, solveSeconds), seconds: TIME_BONUS_SECONDS[size] };
    set({
      phase: "between",
      score: score + gain.points,
      solved: solved + 1,
      timeLeftMs: timeLeftMs + gain.seconds * MS_PER_SECOND,
      lastGain: gain,
    });
  },

  advance: () => {
    if (get().phase !== "between") return;
    set((state) => ({ phase: "playing", round: state.round + 1, lastGain: null }));
  },
}));
