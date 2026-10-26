import { memo } from "react";
import { motion } from "motion/react";
import { Medallion } from "@/components/ui/Medallion";
import { baseAt, COMPOUNDS, compoundMetal } from "@/lib/game/elements";
import { EMPTY } from "@/lib/game/types";

export interface BoardCellProps {
  cell: number;
  size: number;
  value: number;
  notes: number;
  given: boolean;
  selected: boolean;
  peer: boolean;
  sameValue: boolean;
  conflict: boolean;
  dropTarget: boolean;
  cageCompound: string | null;
  label: string;
  onSelect: (cell: number) => void;
}

function NoteDots({ notes, size }: { notes: number; size: number }) {
  const columns = size <= 4 ? 2 : 3;
  return (
    <div className="absolute inset-[12%] grid place-items-center gap-[4%]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: size }, (_, index) => {
        if (!((notes >> index) & 1)) return <span key={index} />;
        const art = baseAt(index);
        return (
          <span
            key={index}
            className="flex aspect-square w-[88%] items-center justify-center rounded-full border border-[#D99A68]"
            style={{ background: `radial-gradient(circle at 40% 30%, ${art.hi}, ${art.color} 55%, ${art.lo})` }}
          >
            <svg viewBox="0 0 48 48" className="h-[62%] w-[62%]" aria-hidden="true">
              <path d={art.icon} fill="none" stroke={art.pale ? art.lo : "#FFFFFF"} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

function GhostCompound({ compoundKey }: { compoundKey: string }) {
  const compound = COMPOUNDS[compoundKey];
  return (
    <span className="pointer-events-none absolute inset-[20%] opacity-[0.42] saturate-[0.55]">
      <Medallion art={compound} metal={compoundMetal(compound)} flat />
    </span>
  );
}

function highlightRing(selected: boolean, conflict: boolean, sameValue: boolean, dropTarget: boolean) {
  if (dropTarget) return "0 0 0 4px #FFFFFF, 0 0 18px rgba(255,255,255,0.85)";
  if (conflict) return "0 0 0 3px #FF5A4E, 0 0 14px rgba(255,90,78,0.85)";
  if (selected) return "0 0 0 3px #FFE07A, 0 0 16px rgba(255,224,122,0.8)";
  if (sameValue) return "0 0 0 2px rgba(255,231,168,0.6)";
  return null;
}

export const BoardCell = memo(function BoardCell(props: BoardCellProps) {
  const { cell, size, value, notes, given, selected, peer, sameValue, conflict, dropTarget, cageCompound, label, onSelect } = props;
  const filled = value !== EMPTY;
  const ring = highlightRing(selected, conflict, sameValue, dropTarget);

  return (
    <button
      type="button"
      data-cell={cell}
      onClick={() => onSelect(cell)}
      aria-label={label}
      aria-pressed={selected}
      className={`relative aspect-square outline-none transition-colors focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[#FFE07A] ${
        selected ? "bg-[#FFE07A]/15" : peer ? "bg-white/[0.06]" : "bg-transparent"
      }`}
    >
      {!filled && (
        <span className="absolute inset-[11%] rounded-full border-2 border-[#8C5A1C] bg-[radial-gradient(circle_at_50%_35%,#24160C,#3A2414)] shadow-[inset_0_3px_7px_rgba(0,0,0,0.7)]" />
      )}
      {filled ? (
        <motion.span
          key={value}
          className={`absolute ${given ? "inset-[9%]" : "inset-[8%]"}`}
          initial={given ? false : { scale: 0.4, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
        >
          <Medallion art={baseAt(value)} flat={given} />
        </motion.span>
      ) : notes !== 0 ? (
        <NoteDots notes={notes} size={size} />
      ) : (
        cageCompound && <GhostCompound compoundKey={cageCompound} />
      )}
      {ring && <span className="pointer-events-none absolute z-10 rounded-full" style={{ inset: filled ? "7%" : "11%", boxShadow: ring }} />}
    </button>
  );
});
