import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StarRecord } from "@/lib/game/stages";
import { isBetter, type SurvivalBest } from "@/lib/game/survival";

interface ProgressState {
  stars: StarRecord;
  bestSeconds: Record<string, number>;
  survivalBest: SurvivalBest | null;
  hydrated: boolean;
  recordResult: (stageId: string, stars: number, seconds: number) => void;
  recordSurvival: (result: SurvivalBest) => boolean;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      stars: {},
      bestSeconds: {},
      survivalBest: null,
      hydrated: false,
      recordResult: (stageId, stars, seconds) =>
        set((state) => ({
          stars: { ...state.stars, [stageId]: Math.max(state.stars[stageId] ?? 0, stars) },
          bestSeconds: { ...state.bestSeconds, [stageId]: Math.min(state.bestSeconds[stageId] ?? Infinity, seconds) },
        })),
      recordSurvival: (result) => {
        if (!isBetter(result, get().survivalBest)) return false;
        set({ survivalBest: result });
        return true;
      },
      resetProgress: () => set({ stars: {}, bestSeconds: {}, survivalBest: null }),
    }),
    {
      name: "uncle-alchemist-progress",
      skipHydration: true,
      partialize: (state) => ({ stars: state.stars, bestSeconds: state.bestSeconds, survivalBest: state.survivalBest }),
      onRehydrateStorage: () => () => useProgressStore.setState({ hydrated: true }),
    },
  ),
);
