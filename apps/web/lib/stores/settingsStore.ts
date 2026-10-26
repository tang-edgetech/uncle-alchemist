import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "zh";

export interface Settings {
  language: Language;
  sfxVolume: number;
  highlightConflicts: boolean;
  highlightSame: boolean;
  showTimer: boolean;
  vibration: boolean;
  reduceMotion: boolean;
}

interface SettingsState extends Settings {
  setLanguage: (language: Language) => void;
  update: (changes: Partial<Settings>) => void;
}

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  sfxVolume: 0.7,
  highlightConflicts: true,
  highlightSame: true,
  showTimer: true,
  vibration: true,
  reduceMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setLanguage: (language) => set({ language }),
      update: (changes) => set(changes),
    }),
    { name: "uncle-alchemist-settings", skipHydration: true },
  ),
);
