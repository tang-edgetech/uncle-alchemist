"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/features/menu/LanguageToggle";
import { GameIcon } from "@/components/ui/GameIcon";
import { Medallion } from "@/components/ui/Medallion";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { BASE_ELEMENTS, basesForSize } from "@/lib/game/elements";
import { isWorldUnlocked, MAX_STARS_PER_STAGE, worldStars, WORLDS } from "@/lib/game/stages";
import { useT } from "@/lib/i18n/translate";
import { useProgressStore } from "@/lib/stores/progressStore";

export function WorldMapScreen() {
  const t = useT();
  const router = useRouter();
  const stars = useProgressStore((state) => state.stars);
  const hydrated = useProgressStore((state) => state.hydrated);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-6 px-4 pb-10 pt-4">
      <div className="flex w-full items-center justify-between">
        <RoundIconButton icon="back" label={t("common.back")} onClick={() => router.push("/")} />
        <LanguageToggle />
      </div>
      <h1 className="text-center font-display text-4xl font-bold text-gold-light text-gold-shadow">{t("stages.title")}</h1>
      <ul className={`flex flex-col gap-4 transition-opacity ${hydrated ? "opacity-100" : "opacity-0"}`}>
        {WORLDS.map((world, index) => {
          const unlocked = isWorldUnlocked(world, stars);
          const earned = worldStars(world, stars);
          const total = world.stageCount * MAX_STARS_PER_STAGE;
          const previous = WORLDS[index - 1];
          const name = t(`world.${world.key}`);
          const body = (
            <span
              className={`flex items-center gap-4 rounded-[19px] bg-[linear-gradient(180deg,#5A3A22,#3E2615)] px-4 py-3 ${unlocked ? "" : "grayscale-[0.7]"}`}
            >
              <span className="flex w-16 shrink-0 flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-mid">{t("stages.worldLabel", { id: world.id })}</span>
                <span className="font-display text-2xl font-bold text-gold-light">
                  {world.size}×{world.size}
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-display text-xl font-semibold text-cream">{name}</span>
                <span className="flex gap-1">
                  {basesForSize(world.size).map((key) => (
                    <span key={key} className="w-6">
                      <Medallion art={BASE_ELEMENTS[key]} flat />
                    </span>
                  ))}
                </span>
                {unlocked ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-gold-light">
                    <GameIcon name="star" filled className="h-4 w-4 text-[#FFC93C]" />
                    {t("stages.starsProgress", { count: earned, total })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-mist">
                    <GameIcon name="lock" className="h-4 w-4" />
                    {previous && t("stages.unlockHint", { stars: world.starsToUnlock, world: t(`world.${previous.key}`) })}
                  </span>
                )}
              </span>
            </span>
          );
          return (
            <li key={world.id}>
              {unlocked ? (
                <Link
                  href={`/stages/${world.id}`}
                  className="block rounded-[24px] bg-gold p-[5px] shadow-[0_5px_0_#4A2F0C,0_12px_22px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[0_2px_0_#4A2F0C]"
                >
                  {body}
                </Link>
              ) : (
                <div className="rounded-[24px] bg-[#6B5A44] p-[5px] opacity-80 shadow-[0_5px_0_#2E2416]" aria-label={`${name}, ${t("stages.locked")}`}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
