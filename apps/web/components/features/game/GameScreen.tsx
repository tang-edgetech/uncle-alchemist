"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { formatClock, starsFor } from "@/lib/game/scoring";
import { isStageUnlocked, isWorldUnlocked, nextStageId, parseStageId, stagePuzzle, WORLDS, type World } from "@/lib/game/stages";
import { useGameClock } from "@/lib/hooks/useGameClock";
import { useGameKeyboard } from "@/lib/hooks/useGameKeyboard";
import { useT } from "@/lib/i18n/translate";
import { useGameStore } from "@/lib/stores/gameStore";
import { useProgressStore } from "@/lib/stores/progressStore";
import { Board } from "./Board";
import { DragLayer } from "./DragLayer";
import { ElementPalette } from "./ElementPalette";
import { GameDialog } from "./GameDialog";
import { RecipePeek } from "./RecipePeek";
import { WinDialog } from "./WinDialog";

const FEEDBACK_MS = 2600;

type PendingConfirm = "reset" | "quit" | null;

export function GameScreen({ stageId }: { stageId: string }) {
  const t = useT();
  const router = useRouter();
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  const [unlockedWorld, setUnlockedWorld] = useState<{ stageId: string; world: World } | null>(null);

  const parsed = parseStageId(stageId);
  const world = parsed?.world ?? WORLDS[0];
  const stageNumber = (parsed?.stageIndex ?? 0) + 1;
  const stagesHref = `/stages/${world.id}`;

  const hydrated = useProgressStore((state) => state.hydrated);
  const stars = useProgressStore((state) => state.stars);
  const unlocked = isStageUnlocked(stageId, stars);

  const puzzle = useGameStore((state) => state.puzzle);
  const status = useGameStore((state) => state.status);
  const mistakes = useGameStore((state) => state.mistakes);
  const elapsedMs = useGameStore((state) => state.elapsedMs);
  const notesMode = useGameStore((state) => state.notesMode);
  const canUndo = useGameStore((state) => state.history.length > 0);
  const feedback = useGameStore((state) => state.feedback);
  const { start, pause, resume, reset, undo, erase, toggleNotesMode, clearFeedback } = useGameStore.getState();

  const ready = puzzle !== null && puzzle.stageId === stageId;
  const seconds = Math.floor(elapsedMs / 1000);
  const playing = status === "playing";
  const earnedStars = ready ? starsFor(puzzle.size, mistakes, seconds, status === "won") : 0;
  const newWorld = unlockedWorld?.stageId === stageId && status === "won" ? unlockedWorld.world : null;

  useEffect(() => {
    if (!hydrated || !unlocked) return;
    const current = useGameStore.getState();
    if (current.puzzle?.stageId !== stageId || current.status === "won") start(stagePuzzle(stageId));
  }, [hydrated, unlocked, stageId, start]);

  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (state.status !== "won" || previous.status === "won" || !state.puzzle || state.puzzle.stageId !== stageId) return;
        const progress = useProgressStore.getState();
        const following = WORLDS.find((candidate) => candidate.id === world.id + 1);
        const wasOpen = following ? isWorldUnlocked(following, progress.stars) : true;
        const runSeconds = Math.floor(state.elapsedMs / 1000);
        progress.recordResult(stageId, starsFor(state.puzzle.size, state.mistakes, runSeconds, true), runSeconds);
        if (following && !wasOpen && isWorldUnlocked(following, useProgressStore.getState().stars)) setUnlockedWorld({ stageId, world: following });
      }),
    [stageId, world.id],
  );

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(clearFeedback, FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [feedback, clearFeedback]);

  useGameClock();
  useGameKeyboard(ready && confirm === null && playing);

  const replay = () => reset();
  const askQuit = () => (canUndo && status !== "won" ? setConfirm("quit") : router.push(stagesHref));
  const confirmAction = () => {
    if (confirm === "reset") reset();
    if (confirm === "quit") router.push(stagesHref);
    setConfirm(null);
  };

  const next = nextStageId(stageId);
  const nextHref = next && isStageUnlocked(next, stars) ? `/play/${next}` : undefined;

  if (hydrated && !unlocked) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center gap-6 px-4">
        <GoldFrame className="w-full" innerClassName="flex flex-col items-center gap-4 p-6 text-center">
          <h1 className="font-display text-2xl font-bold text-gold-light">{t("game.lockedTitle")}</h1>
          <p className="text-sm text-mist">{t("game.lockedBody")}</p>
          <GoldButton href={stagesHref} className="w-full">
            {t("game.stagesMenu")}
          </GoldButton>
        </GoldFrame>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col items-center gap-3 px-3 pb-4 pt-3">
      <header className="flex w-full items-center justify-between gap-2">
        <RoundIconButton icon="back" label={t("game.menu")} onClick={askQuit} />
        <div className="flex items-center gap-3 rounded-full bg-gold p-[3px] shadow-[0_3px_0_#4A2F0C]">
          <div className="flex items-center gap-4 rounded-full bg-[linear-gradient(180deg,#5A3A22,#3E2615)] px-4 py-1.5 text-cream">
            <span className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-mid">{t("game.time")}</span>
              <span className="font-display text-lg font-bold tabular-nums">{formatClock(seconds)}</span>
            </span>
            <span className="h-7 w-px bg-[#8C5A1C]" />
            <span className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-mid">{t("game.mistakes")}</span>
              <span className="font-display text-lg font-bold tabular-nums">{mistakes}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <RoundIconButton
            icon={status === "paused" ? "play" : "pause"}
            label={status === "paused" ? t("game.resume") : t("game.pause")}
            onClick={status === "paused" ? resume : pause}
            disabled={status === "won" || !ready}
          />
          <RoundIconButton icon="reset" label={t("game.reset")} onClick={() => setConfirm("reset")} disabled={!ready} />
        </div>
      </header>

      <p className="-my-1 text-xs font-bold uppercase tracking-wider text-gold-mid">
        {t(`world.${world.key}`)} · {t("game.stageLabel", { world: world.id, stage: stageNumber })}
      </p>

      <section className="relative w-full" style={{ maxWidth: "max(280px, calc(100dvh - 350px))" }}>
        <AnimatePresence>
          {feedback === "notQuite" && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-6 -top-1 z-40 rounded-full bg-[#B8340F] px-4 py-2 text-center text-sm font-bold text-white shadow-lg"
            >
              {t("game.notQuite")}
            </motion.p>
          )}
        </AnimatePresence>
        {ready && status !== "paused" && <Board />}
        {ready && status === "paused" && (
          <div className="flex aspect-square w-full items-center justify-center rounded-[22px] bg-gold p-[7px] shadow-[0_6px_0_#4A2F0C,0_16px_30px_rgba(0,0,0,0.5)]">
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-[linear-gradient(180deg,#5A3A22,#3E2615)] p-6 text-center text-cream">
              <h2 className="font-display text-3xl font-bold text-gold-light">{t("game.paused")}</h2>
              <p className="max-w-60 text-sm text-mist">{t("game.pausedHint")}</p>
              <GoldButton onClick={resume}>{t("game.resume")}</GoldButton>
            </div>
          </div>
        )}
        {!ready && <div className="aspect-square w-full animate-pulse rounded-[22px] bg-black/20" />}
      </section>

      <RecipePeek />

      <div className="w-full">
        <ElementPalette />
      </div>

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

      <GameDialog
        open={confirm !== null}
        title={confirm === "quit" ? t("game.quitTitle") : t("game.resetTitle")}
        onDismiss={() => setConfirm(null)}
        actions={
          <>
            <GoldButton onClick={confirmAction}>{t("game.confirm")}</GoldButton>
            <GoldButton variant="secondary" onClick={() => setConfirm(null)}>
              {t("game.cancel")}
            </GoldButton>
          </>
        }
      >
        <p className="text-sm text-[#5A3A22]">{confirm === "quit" ? t("game.quitBody") : t("game.resetBody")}</p>
      </GameDialog>

      <DragLayer />

      <WinDialog
        open={ready && status === "won"}
        stars={earnedStars}
        seconds={seconds}
        mistakes={mistakes}
        notice={newWorld ? t("game.worldUnlocked", { world: t(`world.${newWorld.key}`) }) : undefined}
        nextHref={nextHref}
        onReplay={replay}
        menuHref={stagesHref}
      />
    </main>
  );
}
