"use client";

import { motion } from "motion/react";
import { GameIcon } from "@/components/ui/GameIcon";
import { GoldButton } from "@/components/ui/GoldButton";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { Medallion } from "@/components/ui/Medallion";
import { BASE_ELEMENTS } from "@/lib/game/elements";
import { isSurvivalUnlocked, SURVIVAL_UNLOCK_WORLD_ID, WORLDS } from "@/lib/game/stages";
import { useProgressStore } from "@/lib/stores/progressStore";
import type { BaseKey } from "@/lib/game/types";
import { useT } from "@/lib/i18n/translate";
import { LanguageToggle } from "./LanguageToggle";

const HERO_ELEMENTS: BaseKey[] = ["wind", "water", "soil", "fire"];

export function LandingScreen() {
  const t = useT();
  const hydrated = useProgressStore((state) => state.hydrated);
  const stars = useProgressStore((state) => state.stars);
  const survivalOpen = hydrated && isSurvivalUnlocked(stars);
  const unlockWorld = WORLDS.find((world) => world.id === SURVIVAL_UNLOCK_WORLD_ID);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col items-center gap-8 px-4 pb-10 pt-4">
      <div className="flex w-full justify-end">
        <LanguageToggle />
      </div>

      <div className="flex flex-col items-center gap-5 pt-4">
        <div className="flex gap-3">
          {HERO_ELEMENTS.map((key, index) => (
            <motion.span
              key={key}
              className="w-16 sm:w-20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.3, ease: "easeInOut" }}
            >
              <Medallion art={BASE_ELEMENTS[key]} />
            </motion.span>
          ))}
        </div>
        <h1 className="text-center font-display text-5xl font-bold text-gold-light text-gold-shadow sm:text-6xl">{t("app.title")}</h1>
        <p className="text-center text-lg text-mist">{t("app.tagline")}</p>
      </div>

      <GoldFrame className="w-full" innerClassName="flex flex-col gap-4 p-6">
        <GoldButton href="/stages">{t("menu.playStages")}</GoldButton>
        <GoldButton href="/recipes" variant="secondary">
          <GameIcon name="book" className="h-5 w-5" />
          {t("menu.recipeBook")}
        </GoldButton>
        {survivalOpen ? (
          <GoldButton href="/play/survival" variant="secondary">
            <GameIcon name="hourglass" className="h-5 w-5" />
            {t("menu.survival")}
          </GoldButton>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <GoldButton variant="secondary" disabled className="w-full">
              <GameIcon name="lock" className="h-5 w-5" />
              {t("menu.survival")}
            </GoldButton>
            {hydrated && unlockWorld && (
              <span className="text-xs text-mist">{t("menu.survivalLocked", { world: t(`world.${unlockWorld.key}`) })}</span>
            )}
          </div>
        )}
        <GoldButton href="/options" variant="secondary">
          <GameIcon name="gear" className="h-5 w-5" />
          {t("menu.options")}
        </GoldButton>
      </GoldFrame>

      <p className="max-w-sm text-center text-sm text-mist">{t("menu.prototypeNote")}</p>
    </main>
  );
}
