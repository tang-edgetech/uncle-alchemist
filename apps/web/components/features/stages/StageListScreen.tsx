"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LanguageToggle } from "@/components/features/menu/LanguageToggle";
import { GameIcon } from "@/components/ui/GameIcon";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { StarRow } from "@/components/ui/StarRow";
import { isStageUnlocked, isWorldUnlocked, MAX_STARS_PER_STAGE, stageIdsOf, worldStars, WORLDS } from "@/lib/game/stages";
import { useT } from "@/lib/i18n/translate";
import { useProgressStore } from "@/lib/stores/progressStore";

export function StageListScreen({ worldId }: { worldId: number }) {
  const t = useT();
  const router = useRouter();
  const stars = useProgressStore((state) => state.stars);
  const hydrated = useProgressStore((state) => state.hydrated);
  const world = WORLDS.find((candidate) => candidate.id === worldId) ?? WORLDS[0];
  const unlocked = isWorldUnlocked(world, stars);

  useEffect(() => {
    if (hydrated && !unlocked) router.replace("/stages");
  }, [hydrated, unlocked, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col gap-6 px-4 pb-10 pt-4">
      <div className="flex w-full items-center justify-between">
        <RoundIconButton icon="back" label={t("common.back")} onClick={() => router.push("/stages")} />
        <LanguageToggle />
      </div>
      <header className="flex flex-col items-center gap-1 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-gold-mid">
          {t("stages.worldLabel", { id: world.id })} · {world.size}×{world.size}
        </span>
        <h1 className="font-display text-4xl font-bold text-gold-light text-gold-shadow">{t(`world.${world.key}`)}</h1>
        <span className="flex items-center gap-1 text-sm font-bold text-gold-light">
          <GameIcon name="star" filled className="h-4 w-4 text-[#FFC93C]" />
          {t("stages.starsProgress", { count: worldStars(world, stars), total: world.stageCount * MAX_STARS_PER_STAGE })}
        </span>
      </header>
      <ol className={`grid grid-cols-3 gap-4 transition-opacity sm:grid-cols-5 ${hydrated && unlocked ? "opacity-100" : "opacity-0"}`}>
        {stageIdsOf(world).map((id, index) => {
          const open = isStageUnlocked(id, stars);
          const earned = stars[id] ?? 0;
          const number = index + 1;
          return (
            <li key={id} className="flex justify-center">
              {open ? (
                <Link
                  href={`/play/${id}`}
                  aria-label={t("stages.stageStars", { n: number, count: earned })}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span className="rounded-full bg-gold p-[4px] shadow-[0_4px_0_#4A2F0C,0_10px_16px_rgba(0,0,0,0.4)] transition-transform group-hover:-translate-y-0.5 group-active:translate-y-[3px]">
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-full font-display text-2xl font-bold shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-4px_0_rgba(0,0,0,0.25)] ${
                        earned > 0 ? "bg-[linear-gradient(180deg,#1F6E6A,#124845)] text-cream" : "bg-[linear-gradient(180deg,#F05A2A,#B8340F)] text-white"
                      }`}
                    >
                      {number}
                    </span>
                  </span>
                  <StarRow count={earned} />
                </Link>
              ) : (
                <span className="flex flex-col items-center gap-1.5 opacity-60" aria-label={t("stages.stageLocked", { n: number })}>
                  <span className="rounded-full bg-[#6B5A44] p-[4px] shadow-[0_4px_0_#2E2416]">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3A2A1C] text-mist">
                      <GameIcon name="lock" className="h-6 w-6" />
                    </span>
                  </span>
                  <StarRow count={0} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
