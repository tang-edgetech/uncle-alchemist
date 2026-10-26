"use client";

import { GameIcon } from "@/components/ui/GameIcon";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export function LanguageToggle() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const next = language === "en" ? "zh" : "en";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      aria-label={next === "zh" ? "切换到中文" : "Switch to English"}
      className="flex min-h-11 items-center gap-2 rounded-full bg-gold p-[3px] shadow-[0_3px_0_#4A2F0C]"
    >
      <span className="flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#5A3A22,#3E2615)] px-4 py-2 text-sm font-bold text-cream">
        <GameIcon name="globe" className="h-5 w-5" />
        {language === "en" ? "中文" : "EN"}
      </span>
    </button>
  );
}
