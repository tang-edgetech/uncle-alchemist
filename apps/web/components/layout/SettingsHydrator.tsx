"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/stores/progressStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export function SettingsHydrator() {
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    useProgressStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return null;
}
