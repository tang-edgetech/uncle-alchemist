import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StarRecord } from "@/lib/game/stages";

interface ProgressState {
  stars: StarRecord;
  bestSeconds: Record<string, number>;
  hydrated: boolean;
  recordResult: (stageId: string, stars: number, seconds: number) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      stars: {},
      bestSeconds: {},
      hydrated: false,
      recordResult: (stageId, stars, seconds) =>
        set((state) => ({
          stars: { ...state.stars, [stageId]: Math.max(state.stars[stageId] ?? 0, stars) },
          bestSeconds: { ...state.bestSeconds, [stageId]: Math.min(state.bestSeconds[stageId] ?? Infinity, seconds) },
        })),
      resetProgress: () => set({ stars: {}, bestSeconds: {} }),
    }),
    {
      name: "uncle-alchemist-progress",
      skipHydration: true,
      partialize: (state) => ({ stars: state.stars, bestSeconds: state.bestSeconds }),
      onRehydrateStorage: () => () => useProgressStore.setState({ hydrated: true }),
    },
  ),
);
