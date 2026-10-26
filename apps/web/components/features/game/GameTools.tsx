"use client";

import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { useT } from "@/lib/i18n/translate";
import { useGameStore } from "@/lib/stores/gameStore";

export function GameTools() {
  const t = useT();
  const playing = useGameStore((state) => state.status === "playing");
  const canUndo = useGameStore((state) => state.history.length > 0);
  const notesMode = useGameStore((state) => state.notesMode);
  const { undo, erase, toggleNotesMode } = useGameStore.getState();

  return (
    <div className="flex w-full items-start justify-center gap-8">
      <RoundIconButton icon="undo" label={t("game.undo")} onClick={undo} disabled={!playing || !canUndo} showLabel />
      <RoundIconButton icon="erase" label={t("game.erase")} onClick={erase} disabled={!playing} showLabel />
      <RoundIconButton
        icon="notes"
        label={notesMode ? t("game.notesOn") : t("game.notes")}
        onClick={toggleNotesMode}
        active={notesMode}
        disabled={!playing}
        showLabel
      />
    </div>
  );
}
