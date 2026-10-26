import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/gameStore";

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

export function useGameKeyboard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      const game = useGameStore.getState();
      if (!game.puzzle) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        game.undo();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key in ARROWS) {
        event.preventDefault();
        game.moveSelection(...ARROWS[event.key]);
        return;
      }
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= game.puzzle.size) {
        game.input(digit - 1);
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "backspace" || key === "delete" || key === "0") game.erase();
      else if (key === "n") game.toggleNotesMode();
      else if (key === "p") (game.status === "paused" ? game.resume : game.pause)();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
