import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "zh";

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "uncle-alchemist-settings", skipHydration: true },
  ),
);
