import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useDragStore } from "@/lib/stores/dragStore";
import { useGameStore } from "@/lib/stores/gameStore";

const DRAG_THRESHOLD_PX = 6;

interface Press {
  value: number;
  startX: number;
  startY: number;
  dragging: boolean;
}

function cellAt(x: number, y: number): number | null {
  const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cell]");
  return target ? Number(target.dataset.cell) : null;
}

export function usePaletteDrag() {
  const press = useRef<Press | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const current = press.current;
      if (!current) return;
      if (!current.dragging) {
        const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
        if (distance < DRAG_THRESHOLD_PX) return;
        current.dragging = true;
        useDragStore.getState().begin(current.value, event.clientX, event.clientY);
      }
      useDragStore.getState().move(event.clientX, event.clientY, cellAt(event.clientX, event.clientY));
    };

    const onUp = (event: PointerEvent) => {
      const current = press.current;
      if (!current) return;
      press.current = null;
      const game = useGameStore.getState();
      if (current.dragging) {
        const target = cellAt(event.clientX, event.clientY);
        useDragStore.getState().end();
        if (target === null) return;
        game.select(target);
      }
      game.input(current.value);
    };

    const onCancel = () => {
      press.current = null;
      useDragStore.getState().end();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, []);

  return useCallback((value: number, event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    press.current = { value, startX: event.clientX, startY: event.clientY, dragging: false };
  }, []);
}
