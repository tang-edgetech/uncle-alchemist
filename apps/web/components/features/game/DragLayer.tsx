"use client";

import { Medallion } from "@/components/ui/Medallion";
import { baseAt } from "@/lib/game/elements";
import { useDragStore } from "@/lib/stores/dragStore";

const GHOST_SIZE_PX = 64;

export function DragLayer() {
  const value = useDragStore((state) => state.value);
  const x = useDragStore((state) => state.x);
  const y = useDragStore((state) => state.y);

  if (value === null) return null;
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[60] drop-shadow-[0_12px_14px_rgba(0,0,0,0.5)]"
      style={{ width: GHOST_SIZE_PX, transform: `translate(${x - GHOST_SIZE_PX / 2}px, ${y - GHOST_SIZE_PX * 0.9}px) scale(1.1)` }}
    >
      <Medallion art={baseAt(value)} />
    </div>
  );
}
