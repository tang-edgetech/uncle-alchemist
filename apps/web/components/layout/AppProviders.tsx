"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useProgressStore } from "@/lib/stores/progressStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export function AppProviders({ children }: { children: ReactNode }) {
  const language = useSettingsStore((state) => state.language);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    useProgressStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>{children}</MotionConfig>;
}
