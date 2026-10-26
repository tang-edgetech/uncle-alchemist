"use client";

import { useId, useState, type ReactNode } from "react";
import { GameDialog } from "@/components/features/game/GameDialog";
import { GoldButton } from "@/components/ui/GoldButton";
import { GoldSwitch } from "@/components/ui/GoldSwitch";
import { playSfx } from "@/lib/audio/sfx";
import { useT, type TranslationKey } from "@/lib/i18n/translate";
import { useProgressStore } from "@/lib/stores/progressStore";
import { useSettingsStore, type Language, type Settings } from "@/lib/stores/settingsStore";

type ToggleKey = "highlightConflicts" | "highlightSame" | "showTimer" | "vibration" | "reduceMotion";

const TOGGLES: { key: ToggleKey; label: TranslationKey; hint: TranslationKey }[] = [
  { key: "highlightConflicts", label: "options.highlightConflicts", hint: "options.highlightConflictsHint" },
  { key: "highlightSame", label: "options.highlightSame", hint: "options.highlightSameHint" },
  { key: "showTimer", label: "options.showTimer", hint: "options.showTimerHint" },
  { key: "vibration", label: "options.vibration", hint: "options.vibrationHint" },
  { key: "reduceMotion", label: "options.reduceMotion", hint: "options.reduceMotionHint" },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

const VOLUME_STEP = 5;

function OptionRow({ children }: { children: ReactNode }) {
  return <li className="flex items-center justify-between gap-4 rounded-2xl bg-black/20 px-4 py-3">{children}</li>;
}

function ToggleRow({ setting, label, hint }: { setting: ToggleKey; label: string; hint: string }) {
  const id = useId();
  const checked = useSettingsStore((state) => state[setting]);
  const update = useSettingsStore((state) => state.update);
  return (
    <OptionRow>
      <span className="min-w-0">
        <span id={`${id}-label`} className="block font-display text-lg font-semibold text-cream">
          {label}
        </span>
        <span id={`${id}-hint`} className="block text-sm text-mist">
          {hint}
        </span>
      </span>
      <GoldSwitch
        checked={checked}
        onChange={(value) => update({ [setting]: value } as Partial<Settings>)}
        labelledBy={`${id}-label`}
        describedBy={`${id}-hint`}
      />
    </OptionRow>
  );
}

export function OptionsPanel({ allowReset }: { allowReset: boolean }) {
  const t = useT();
  const volumeId = useId();
  const language = useSettingsStore((state) => state.language);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const { setLanguage, update } = useSettingsStore.getState();
  const resetProgress = useProgressStore((state) => state.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const volumePercent = Math.round(sfxVolume * 100);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        <OptionRow>
          <span className="font-display text-lg font-semibold text-cream">{t("options.language")}</span>
          <span className="flex rounded-full bg-gold p-[3px] shadow-[0_2px_0_#4A2F0C]" role="radiogroup" aria-label={t("options.language")}>
            {LANGUAGES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={language === option.value}
                onClick={() => setLanguage(option.value)}
                className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                  language === option.value ? "bg-[linear-gradient(180deg,#1F6E6A,#124845)] text-cream" : "bg-[#3A2414] text-mist"
                }`}
              >
                {option.label}
              </button>
            ))}
          </span>
        </OptionRow>

        <OptionRow>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor={volumeId} className="flex items-baseline justify-between font-display text-lg font-semibold text-cream">
              {t("options.sound")}
              <span className="text-sm font-bold text-gold-mid">{volumePercent === 0 ? t("options.soundOff") : `${volumePercent}%`}</span>
            </label>
            <input
              id={volumeId}
              type="range"
              min={0}
              max={100}
              step={VOLUME_STEP}
              value={volumePercent}
              onChange={(event) => update({ sfxVolume: Number(event.target.value) / 100 })}
              onPointerUp={() => playSfx("place")}
              onKeyUp={() => playSfx("place")}
              className="h-2 w-full cursor-pointer accent-[#E7B455]"
            />
          </span>
        </OptionRow>

        {TOGGLES.map((toggle) => (
          <ToggleRow key={toggle.key} setting={toggle.key} label={t(toggle.label)} hint={t(toggle.hint)} />
        ))}
      </ul>

      {allowReset && (
        <div className="mt-2 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-[#B8340F]/70 px-4 py-3">
          <p className="text-sm text-mist">{t("options.resetHint")}</p>
          {resetDone && (
            <p role="status" className="text-sm font-bold text-[#9BE3C9]">
              {t("options.resetDone")}
            </p>
          )}
          <GoldButton onClick={() => setConfirmReset(true)}>{t("options.resetProgress")}</GoldButton>
        </div>
      )}

      <GameDialog
        open={confirmReset}
        title={t("options.resetTitle")}
        onDismiss={() => setConfirmReset(false)}
        actions={
          <>
            <GoldButton
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
                setResetDone(true);
              }}
            >
              {t("options.resetConfirm")}
            </GoldButton>
            <GoldButton variant="secondary" onClick={() => setConfirmReset(false)}>
              {t("game.cancel")}
            </GoldButton>
          </>
        }
      >
        <p className="text-sm text-[#5A3A22]">{t("options.resetBody")}</p>
      </GameDialog>
    </div>
  );
}
