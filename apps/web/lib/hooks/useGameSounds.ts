import { useEffect } from "react";
import { playSfx } from "@/lib/audio/sfx";
import { EMPTY } from "@/lib/game/types";
import { useGameStore } from "@/lib/stores/gameStore";

export function useGameSounds() {
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (state.puzzle !== previous.puzzle) return;
        if (state.status === "won" && previous.status !== "won") {
          playSfx("solve");
          return;
        }
        if (state.mistakes > previous.mistakes) {
          playSfx("mistake");
          return;
        }
        if (state.values !== previous.values) {
          const placed = state.values.some((value, cell) => value !== EMPTY && value !== previous.values[cell]);
          playSfx(placed ? "place" : "erase");
          return;
        }
        if (state.notes !== previous.notes) playSfx("note");
      }),
    [],
  );
}
