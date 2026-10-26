"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useMemo } from "react";
import { Medallion } from "@/components/ui/Medallion";
import { BASE_ELEMENTS, COMPOUNDS, compoundMetal } from "@/lib/game/elements";
import { cageIndexByCell } from "@/lib/game/rules";
import { useT, type TranslationKey } from "@/lib/i18n/translate";
import { useGameStore } from "@/lib/stores/gameStore";

export function RecipePeek() {
  const t = useT();
  const puzzle = useGameStore((state) => state.puzzle);
  const selected = useGameStore((state) => state.selected);
  const cageOfCell = useMemo(() => (puzzle ? cageIndexByCell(puzzle) : []), [puzzle]);

  const cageIndex = selected !== null ? cageOfCell[selected] ?? -1 : -1;
  const compound = puzzle && cageIndex >= 0 ? COMPOUNDS[puzzle.cages[cageIndex].compound] : null;

  return (
    <div className="flex min-h-[78px] w-full items-center justify-center" aria-live="polite">
      <AnimatePresence mode="wait">
        {compound ? (
          <motion.div
            key={compound.key}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="w-full rounded-[20px] bg-gold p-[4px] shadow-[0_4px_0_#4A2F0C,0_10px_20px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center gap-3 rounded-[16px] bg-parchment px-3 py-2 text-ink">
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="w-11">
                  <Medallion art={compound} metal={compoundMetal(compound)} flat />
                </span>
                <span className="font-display text-xl font-bold">=</span>
                {compound.ingredients.map((ingredient, index) => (
                  <Fragment key={ingredient}>
                    {index > 0 && <span className="font-display text-xl font-bold">+</span>}
                    <span className="w-9">
                      <Medallion art={BASE_ELEMENTS[ingredient]} flat />
                    </span>
                  </Fragment>
                ))}
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-semibold leading-tight">
                  {t(`compound.${compound.key}` as TranslationKey)} ={" "}
                  {compound.ingredients.map((ingredient) => t(`element.${ingredient}`)).join(" + ")}
                </p>
                <p className="text-xs leading-snug text-[#5A3A22]">{t("game.peekHint")}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-2 text-center text-sm leading-snug text-mist"
          >
            {selected === null ? t("game.selectCell") : t("game.rules")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
