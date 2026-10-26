"use client";

import { useCallback, useMemo } from "react";
import { BASE_ORDER, COMPOUNDS } from "@/lib/game/elements";
import { cageBox, cageFill, cageOutline, gridLines, type Rect, type Segment } from "@/lib/game/geometry";
import { cageIndexByCell, findConflicts, peersOf } from "@/lib/game/rules";
import { EMPTY } from "@/lib/game/types";
import { useT, type TranslationKey } from "@/lib/i18n/translate";
import { useDragStore } from "@/lib/stores/dragStore";
import { useGameStore } from "@/lib/stores/gameStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { BoardCell } from "./BoardCell";

const CAGE_INSET = 0.04;
const TRAY_RADIUS = 0.42;
const TRAY_FILL_OPACITY = 0.2;
const MIN_BORDER_LUMINANCE = 0.32;

interface CageShape {
  color: string;
  border: string;
  box: Rect | null;
  fill: Rect[];
  outline: Segment[];
}

function luminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function Board() {
  const t = useT();
  const puzzle = useGameStore((state) => state.puzzle);
  const values = useGameStore((state) => state.values);
  const notes = useGameStore((state) => state.notes);
  const selected = useGameStore((state) => state.selected);
  const select = useGameStore((state) => state.select);
  const dropCell = useDragStore((state) => (state.value !== null ? state.overCell : null));
  const highlightConflicts = useSettingsStore((state) => state.highlightConflicts);
  const highlightSame = useSettingsStore((state) => state.highlightSame);

  const lines = useMemo(() => (puzzle ? gridLines(puzzle.size, puzzle.regions) : null), [puzzle]);
  const cageShapes = useMemo<CageShape[]>(
    () =>
      puzzle
        ? puzzle.cages.map((cage) => {
            const compound = COMPOUNDS[cage.compound];
            return {
              color: compound.color,
              border: luminance(compound.color) < MIN_BORDER_LUMINANCE ? compound.hi : compound.color,
              box: cageBox(puzzle.size, cage.cells, CAGE_INSET),
              fill: cageFill(puzzle.size, cage.cells, CAGE_INSET),
              outline: cageOutline(puzzle.size, cage.cells, CAGE_INSET),
            };
          })
        : [],
    [puzzle],
  );
  const cageOfCell = useMemo(() => (puzzle ? cageIndexByCell(puzzle) : []), [puzzle]);
  const conflicts = useMemo(() => (puzzle ? findConflicts(puzzle, values) : new Set<number>()), [puzzle, values]);
  const peers = useMemo(() => new Set(puzzle && selected !== null ? peersOf(puzzle, selected) : []), [puzzle, selected]);
  const onSelect = useCallback((cell: number) => select(cell), [select]);

  if (!puzzle || !lines) return null;
  const { size } = puzzle;
  const selectedValue = selected !== null ? values[selected] : EMPTY;
  const compoundOf = (cell: number) => (cageOfCell[cell] >= 0 ? puzzle.cages[cageOfCell[cell]].compound : null);

  const labelFor = (cell: number) => {
    const value = values[cell];
    const parts = [
      value === EMPTY
        ? t("game.cellEmpty")
        : t(puzzle.givens[cell] !== EMPTY ? "game.cellGiven" : "game.cellPlaced", { element: t(`element.${BASE_ORDER[value]}`) }),
    ];
    const compound = compoundOf(cell);
    if (compound) parts.push(t("game.cellInCage", { compound: t(`compound.${compound}` as TranslationKey) }));
    return parts.join(", ");
  };

  return (
    <div className="rounded-[22px] bg-gold p-[7px] shadow-[0_6px_0_#4A2F0C,0_16px_30px_rgba(0,0,0,0.5)]">
      <div className="rounded-[16px] bg-[linear-gradient(180deg,#5A3A22,#3E2615)] p-[6px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]">
        <div className="relative">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            {cageShapes.map((shape, cageIndex) =>
              shape.box ? (
                <rect key={`f${cageIndex}`} {...shape.box} rx={TRAY_RADIUS} fill={shape.color} fillOpacity={TRAY_FILL_OPACITY} />
              ) : (
                shape.fill.map((rect, index) => (
                  <rect key={`f${cageIndex}-${index}`} {...rect} fill={shape.color} fillOpacity={TRAY_FILL_OPACITY} />
                ))
              ),
            )}
          </svg>
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }} role="grid">
            {values.map((value, cell) => (
              <BoardCell
                key={cell}
                cell={cell}
                size={size}
                value={value}
                notes={notes[cell]}
                given={puzzle.givens[cell] !== EMPTY}
                selected={selected === cell}
                peer={peers.has(cell)}
                sameValue={highlightSame && selectedValue !== EMPTY && value === selectedValue && selected !== cell}
                conflict={highlightConflicts && conflicts.has(cell)}
                dropTarget={dropCell === cell}
                cageCompound={compoundOf(cell)}
                label={labelFor(cell)}
                onSelect={onSelect}
              />
            ))}
          </div>
          <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            {lines.cellEdges.map((edge, index) => (
              <line key={`c${index}`} {...edge} stroke="rgba(185,138,62,0.3)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {lines.regionEdges.map((edge, index) => (
              <line key={`r${index}`} {...edge} stroke="#E7B455" strokeOpacity={0.85} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
            {cageShapes.map((shape, cageIndex) =>
              shape.box ? (
                <g key={`b${cageIndex}`}>
                  <rect {...shape.box} rx={TRAY_RADIUS} fill="none" stroke={shape.border} strokeOpacity={0.35} strokeWidth={9} vectorEffect="non-scaling-stroke" />
                  <rect {...shape.box} rx={TRAY_RADIUS} fill="none" stroke="rgba(20,10,4,0.5)" strokeWidth={5} vectorEffect="non-scaling-stroke" />
                  <rect {...shape.box} rx={TRAY_RADIUS} fill="none" stroke={shape.border} strokeWidth={3} vectorEffect="non-scaling-stroke" />
                </g>
              ) : (
                <g key={`b${cageIndex}`}>
                  {shape.outline.map((segment, index) => (
                    <line key={`g${index}`} {...segment} stroke={shape.border} strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  ))}
                  {shape.outline.map((segment, index) => (
                    <line key={`d${index}`} {...segment} stroke="rgba(20,10,4,0.5)" strokeWidth={5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  ))}
                  {shape.outline.map((segment, index) => (
                    <line key={`s${index}`} {...segment} stroke={shape.border} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
              ),
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
