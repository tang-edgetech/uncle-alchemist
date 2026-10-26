"use client";

import { Medallion } from "@/components/ui/Medallion";
import { BASE_ELEMENTS, basesForSize } from "@/lib/game/elements";
import { usePaletteDrag } from "@/lib/hooks/usePaletteDrag";
import { useT } from "@/lib/i18n/translate";
import { useGameStore } from "@/lib/stores/gameStore";

export function ElementPalette() {
  const t = useT();
  const puzzle = useGameStore((state) => state.puzzle);
  const values = useGameStore((state) => state.values);
  const notesMode = useGameStore((state) => state.notesMode);
  const input = useGameStore((state) => state.input);
  const disabled = useGameStore((state) => state.status !== "playing");
  const startPress = usePaletteDrag();

  if (!puzzle) return null;
  const keys = basesForSize(puzzle.size);

  return (
    <div className="flex w-full items-end justify-center gap-[2%]">
      {keys.map((key, index) => {
        const placed = values.filter((value) => value === index).length;
        const complete = placed >= puzzle.size;
        return (
          <button
            key={key}
            type="button"
            onPointerDown={(event) => startPress(index, event)}
            onClick={(event) => {
              if (event.detail === 0) input(index);
            }}
            disabled={disabled}
            aria-label={t("game.place", { element: t(`element.${key}`) })}
            className="group relative flex max-w-16 flex-1 touch-none select-none flex-col items-center gap-1 disabled:opacity-50"
          >
            <span
              className={`relative w-full transition-transform group-hover:-translate-y-0.5 group-active:translate-y-[2px] ${
                complete ? "opacity-40 saturate-50" : ""
              } ${notesMode ? "scale-[0.82]" : ""}`}
            >
              <Medallion art={BASE_ELEMENTS[key]} />
              {notesMode && <span className="absolute inset-[-8%] rounded-full border-2 border-dashed border-[#FFE07A]" />}
            </span>
            <span className="text-[11px] font-bold leading-none text-cream/90">{index + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
