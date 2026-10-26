import { useCallback } from "react";
import { useSettingsStore, type Language } from "@/lib/stores/settingsStore";
import en from "./en.json";
import zh from "./zh.json";

export type TranslationKey = keyof typeof en;

export type TranslationVars = Record<string, string | number>;

const dictionaries: Record<Language, Record<string, string>> = { en, zh };

export function translate(language: Language, key: TranslationKey, vars?: TranslationVars): string {
  const template = dictionaries[language][key] ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function useT() {
  const language = useSettingsStore((state) => state.language);
  return useCallback((key: TranslationKey, vars?: TranslationVars) => translate(language, key, vars), [language]);
}
