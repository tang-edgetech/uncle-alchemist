"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/features/menu/LanguageToggle";
import { GameIcon } from "@/components/ui/GameIcon";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { Medallion } from "@/components/ui/Medallion";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { BASE_ELEMENTS, compoundMetal } from "@/lib/game/elements";
import { isWorldUnlocked, recipeChapters, WORLDS, type RecipeChapter } from "@/lib/game/stages";
import type { Compound } from "@/lib/game/types";
import { useT, type TranslationKey } from "@/lib/i18n/translate";
import { useProgressStore } from "@/lib/stores/progressStore";

const CHAPTERS = recipeChapters();

function RecipeRow({ compound }: { compound: Compound }) {
  const t = useT();
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-2">
      <span className="w-12 shrink-0">
        <Medallion art={compound} metal={compoundMetal(compound)} flat />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold leading-tight text-gold-light">
          {t(`compound.${compound.key}` as TranslationKey)}
        </span>
        <span className="block text-sm text-mist">{compound.ingredients.map((ingredient) => t(`element.${ingredient}`)).join(" + ")}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {compound.ingredients.map((ingredient, index) => (
          <Fragment key={ingredient}>
            {index > 0 && <span className="font-display text-sm font-bold text-gold-mid">+</span>}
            <span className="w-7">
              <Medallion art={BASE_ELEMENTS[ingredient]} flat />
            </span>
          </Fragment>
        ))}
      </span>
    </li>
  );
}

function RecipeGroup({ title, compounds }: { title?: string; compounds: Compound[] }) {
  if (compounds.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {title && <h3 className="text-xs font-bold uppercase tracking-wider text-gold-mid">{title}</h3>}
      <ul className="grid gap-2 sm:grid-cols-2">
        {compounds.map((compound) => (
          <RecipeRow key={compound.key} compound={compound} />
        ))}
      </ul>
    </div>
  );
}

function Chapter({ chapter, index, unlocked }: { chapter: RecipeChapter; index: number; unlocked: boolean }) {
  const t = useT();
  const { world, newBases, newCompounds } = chapter;
  const pairs = newCompounds.filter((compound) => compound.tier === 1);
  const triples = newCompounds.filter((compound) => compound.tier === 2);
  const previous = WORLDS[index - 1];

  return (
    <GoldFrame innerClassName="flex flex-col gap-4 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gold-mid">{t("recipes.chapter", { n: index + 1 })}</p>
          <h2 className="font-display text-2xl font-bold text-gold-light">{t(`world.${world.key}`)}</h2>
        </div>
        <span className="text-sm text-mist">{t("recipes.chapterGrid", { size: world.size })}</span>
      </header>

      {!unlocked && previous && (
        <p className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm text-mist">
          <GameIcon name="lock" className="h-4 w-4 shrink-0" />
          {t("recipes.lockedChapter", { world: t(`world.${world.key}`) })}
        </p>
      )}

      <div className={`flex flex-col gap-4 ${unlocked ? "" : "pointer-events-none opacity-45 grayscale"}`} aria-disabled={!unlocked}>
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-mid">{t("recipes.newBases")}</h3>
          <ul className="flex flex-wrap gap-4">
            {newBases.map((key) => (
              <li key={key} className="flex flex-col items-center gap-1">
                <span className="w-14">
                  <Medallion art={BASE_ELEMENTS[key]} />
                </span>
                <span className="font-display font-semibold">{t(`element.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        {newCompounds.length === 0 ? (
          <p className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-mist">{t("recipes.noRecipes")}</p>
        ) : (
          <>
            <RecipeGroup title={triples.length ? t("recipes.twoElement") : t("recipes.newRecipes")} compounds={pairs} />
            <RecipeGroup title={t("recipes.threeElement")} compounds={triples} />
          </>
        )}
      </div>
    </GoldFrame>
  );
}

export function RecipeBookScreen() {
  const t = useT();
  const router = useRouter();
  const stars = useProgressStore((state) => state.stars);
  const hydrated = useProgressStore((state) => state.hydrated);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col gap-6 px-4 pb-12 pt-4">
      <div className="flex w-full items-center justify-between">
        <RoundIconButton icon="back" label={t("common.back")} onClick={() => router.push("/")} />
        <LanguageToggle />
      </div>
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-4xl font-bold text-gold-light text-gold-shadow">{t("recipes.title")}</h1>
        <p className="max-w-lg text-sm text-mist">{t("recipes.intro")}</p>
      </header>
      <div className={`flex flex-col gap-6 transition-opacity ${hydrated ? "opacity-100" : "opacity-0"}`}>
        {CHAPTERS.map((chapter, index) => (
          <Chapter key={chapter.world.id} chapter={chapter} index={index} unlocked={isWorldUnlocked(chapter.world, stars)} />
        ))}
      </div>
    </main>
  );
}
