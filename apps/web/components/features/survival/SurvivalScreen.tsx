"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Board } from "@/components/features/game/Board";
import { DragLayer } from "@/components/features/game/DragLayer";
import { ElementPalette } from "@/components/features/game/ElementPalette";
import { FloatingBanner } from "@/components/features/game/FloatingBanner";
import { GameDialog } from "@/components/features/game/GameDialog";
import { GameTools } from "@/components/features/game/GameTools";
import { PausedBoard } from "@/components/features/game/PausedBoard";
import { RecipePeek } from "@/components/features/game/RecipePeek";
import { StatPill } from "@/components/features/game/StatPill";
import { OptionsModal } from "@/components/features/options/OptionsModal";
import { GameIcon } from "@/components/ui/GameIcon";
import { GoldButton } from "@/components/ui/GoldButton";
import { GoldFrame } from "@/components/ui/GoldFrame";
import { RoundIconButton } from "@/components/ui/RoundIconButton";
import { playSfx } from "@/lib/audio/sfx";
import { randomSeed } from "@/lib/game/rng";
import { formatClock } from "@/lib/game/scoring";
import { isSurvivalUnlocked, WORLDS, SURVIVAL_UNLOCK_WORLD_ID } from "@/lib/game/stages";
import { MISTAKE_PENALTY_SECONDS, sizeForRound, SURVIVAL_LIVES, SURVIVAL_START_SECONDS, TIME_BONUS_SECONDS } from "@/lib/game/survival";
import { challengeFor } from "@/lib/game/templates";
import { useGameClock } from "@/lib/hooks/useGameClock";
import { useGameKeyboard } from "@/lib/hooks/useGameKeyboard";
import { useGameSounds } from "@/lib/hooks/useGameSounds";
import { useT } from "@/lib/i18n/translate";
import { useGameStore } from "@/lib/stores/gameStore";
import { useProgressStore } from "@/lib/stores/progressStore";
import { useSurvivalStore } from "@/lib/stores/survivalStore";

const NEXT_PUZZLE_DELAY_MS = 1600;
const LIFE_LOST_BANNER_MS = 1600;
const LOW_TIME_MS = 30000;
const TICK_MS = 250;
const HEART_SLOTS = Array.from({ length: SURVIVAL_LIVES }, (_, slot) => slot);

function startPuzzle(round: number) {
  useGameStore.getState().start(challengeFor(sizeForRound(round), randomSeed()));
}

export function SurvivalScreen() {
  const t = useT();
  const router = useRouter();
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [lifeLostAt, setLifeLostAt] = useState<number | null>(null);

  const hydrated = useProgressStore((state) => state.hydrated);
  const stars = useProgressStore((state) => state.stars);
  const best = useProgressStore((state) => state.survivalBest);
  const unlocked = isSurvivalUnlocked(stars);

  const phase = useSurvivalStore((state) => state.phase);
  const round = useSurvivalStore((state) => state.round);
  const lives = useSurvivalStore((state) => state.lives);
  const timeLeftMs = useSurvivalStore((state) => state.timeLeftMs);
  const score = useSurvivalStore((state) => state.score);
  const solved = useSurvivalStore((state) => state.solved);
  const lastGain = useSurvivalStore((state) => state.lastGain);
  const endReason = useSurvivalStore((state) => state.endReason);

  const gameStatus = useGameStore((state) => state.status);
  const { pause, resume } = useGameStore.getState();

  const size = sizeForRound(round);
  const inRun = phase === "playing" || phase === "between";

  useEffect(() => {
    useSurvivalStore.getState().reset();
    return () => {
      useSurvivalStore.getState().reset();
      useGameStore.getState().stop();
    };
  }, []);

  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (useSurvivalStore.getState().phase !== "playing" || state.puzzle !== previous.puzzle) return;
        if (state.mistakes > previous.mistakes) {
          useSurvivalStore.getState().loseLife();
          setLifeLostAt(Date.now());
        }
        if (state.status === "won" && previous.status !== "won") useSurvivalStore.getState().solve(Math.floor(state.elapsedMs / 1000));
      }),
    [],
  );

  useEffect(
    () =>
      useSurvivalStore.subscribe((state, previous) => {
        if (state.phase !== "over" || previous.phase === "over") return;
        useGameStore.getState().stop();
        playSfx("gameOver");
        setNewBest(useProgressStore.getState().recordSurvival({ score: state.score, solved: state.solved }));
      }),
    [],
  );

  useEffect(() => {
    if (phase !== "between") return;
    const timer = window.setTimeout(() => {
      const survival = useSurvivalStore.getState();
      survival.advance();
      startPuzzle(survival.round);
    }, NEXT_PUZZLE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || gameStatus !== "playing") return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      useSurvivalStore.getState().tick(now - last);
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [phase, gameStatus]);

  useEffect(() => {
    if (lifeLostAt === null) return;
    const timer = window.setTimeout(() => setLifeLostAt(null), LIFE_LOST_BANNER_MS);
    return () => window.clearTimeout(timer);
  }, [lifeLostAt]);

  useGameClock();
  useGameSounds();
  useGameKeyboard(phase === "playing" && gameStatus === "playing" && !confirmQuit && !optionsOpen);

  const beginRun = () => {
    setNewBest(false);
    useSurvivalStore.getState().begin();
    startPuzzle(0);
  };

  const quit = () => {
    setConfirmQuit(false);
    useSurvivalStore.getState().reset();
    useGameStore.getState().stop();
    router.push("/");
  };

  const unlockWorld = WORLDS.find((world) => world.id === SURVIVAL_UNLOCK_WORLD_ID);

  if (hydrated && !unlocked) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center gap-6 px-4">
        <GoldFrame className="w-full" innerClassName="flex flex-col items-center gap-4 p-6 text-center">
          <GameIcon name="lock" className="h-10 w-10 text-mist" />
          <h1 className="font-display text-2xl font-bold text-gold-light">{t("survival.lockedTitle")}</h1>
          <p className="text-sm text-mist">{unlockWorld && t("survival.lockedBody", { world: t(`world.${unlockWorld.key}`) })}</p>
          <GoldButton href="/stages" className="w-full">
            {t("game.stagesMenu")}
          </GoldButton>
        </GoldFrame>
      </main>
    );
  }

  const banner =
    phase === "between" && lastGain
      ? { message: t("survival.solvedGain", { points: lastGain.points, seconds: lastGain.seconds }), tone: "success" as const }
      : lifeLostAt !== null && phase === "playing"
        ? { message: t("survival.lifeLost", { seconds: MISTAKE_PENALTY_SECONDS }), tone: "danger" as const }
        : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col items-center gap-3 px-3 pb-4 pt-3">
      <header className="flex w-full items-center justify-between gap-2">
        <RoundIconButton icon="back" label={t("game.menu")} onClick={() => (inRun ? setConfirmQuit(true) : router.push("/"))} />
        <StatPill
          stats={[
            { label: t("survival.timeLeft"), value: formatClock(Math.ceil(timeLeftMs / 1000)), alert: inRun && timeLeftMs < LOW_TIME_MS },
            { label: t("survival.score"), value: score },
          ]}
        />
        <RoundIconButton
          icon={gameStatus === "paused" ? "play" : "pause"}
          label={gameStatus === "paused" ? t("game.resume") : t("game.pause")}
          onClick={gameStatus === "paused" ? resume : pause}
          disabled={phase !== "playing"}
        />
      </header>

      {inRun && (
        <div className="-my-1 flex items-center gap-3">
          <span className="flex gap-0.5" role="img" aria-label={t("survival.livesLabel", { count: lives })}>
            {HEART_SLOTS.map((slot) => (
              <GameIcon key={slot} name="heart" filled className={`h-5 w-5 ${slot < lives ? "text-[#FF4D5E]" : "text-black/40"}`} />
            ))}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-mid">{t("survival.round", { n: round + 1, size })}</span>
        </div>
      )}

      <section className="relative w-full" style={{ maxWidth: "max(280px, calc(100dvh - 350px))" }}>
        <FloatingBanner message={banner?.message ?? null} tone={banner?.tone ?? "success"} />
        {inRun && gameStatus !== "paused" && <Board />}
        {inRun && gameStatus === "paused" && <PausedBoard onResume={resume} onOptions={() => setOptionsOpen(true)} />}
        {phase === "over" && <Board />}
        {phase === "ready" && (
          <GoldFrame innerClassName="flex flex-col gap-4 p-6 text-cream">
            <div className="flex items-center gap-3">
              <GameIcon name="hourglass" className="h-10 w-10 text-gold-light" />
              <h1 className="font-display text-3xl font-bold text-gold-light">{t("survival.title")}</h1>
            </div>
            <p className="text-sm text-mist">{t("survival.intro")}</p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="rounded-xl bg-black/20 px-3 py-2">
                {t("survival.ruleStart", { time: formatClock(SURVIVAL_START_SECONDS), lives: SURVIVAL_LIVES })}
              </li>
              <li className="rounded-xl bg-black/20 px-3 py-2">
                {t("survival.ruleBonus", { a: TIME_BONUS_SECONDS[4], b: TIME_BONUS_SECONDS[5], c: TIME_BONUS_SECONDS[6], d: TIME_BONUS_SECONDS[7] })}
              </li>
              <li className="rounded-xl bg-black/20 px-3 py-2">{t("survival.ruleMistake", { seconds: MISTAKE_PENALTY_SECONDS })}</li>
              <li className="rounded-xl bg-black/20 px-3 py-2">{t("survival.ruleScore")}</li>
            </ul>
            <p className="text-center text-sm font-bold text-gold-light">
              {best ? t("survival.best", { score: best.score, solved: best.solved }) : t("survival.noBest")}
            </p>
            <GoldButton onClick={beginRun} disabled={!hydrated}>
              {t("survival.start")}
            </GoldButton>
          </GoldFrame>
        )}
      </section>

      {inRun && (
        <>
          <RecipePeek />
          <div className="w-full">
            <ElementPalette />
          </div>
          <GameTools />
        </>
      )}

      <GameDialog
        open={confirmQuit}
        title={t("survival.quitTitle")}
        onDismiss={() => setConfirmQuit(false)}
        actions={
          <>
            <GoldButton onClick={quit}>{t("game.confirm")}</GoldButton>
            <GoldButton variant="secondary" onClick={() => setConfirmQuit(false)}>
              {t("game.cancel")}
            </GoldButton>
          </>
        }
      >
        <p className="text-sm text-[#5A3A22]">{t("survival.quitBody")}</p>
      </GameDialog>

      <GameDialog
        open={phase === "over"}
        title={endReason === "lives" ? t("survival.overLives") : t("survival.overTime")}
        actions={
          <>
            <GoldButton onClick={beginRun}>{t("survival.playAgain")}</GoldButton>
            <GoldButton href="/" variant="secondary">
              {t("game.menu")}
            </GoldButton>
          </>
        }
      >
        {newBest && <p className="rounded-xl bg-[#1F6E6A] px-3 py-2 text-sm font-bold text-white">{t("survival.newBest")}</p>}
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-[#F2E3BF] px-3 py-2">
            <dt className="text-[#7A4F17]">{t("survival.score")}</dt>
            <dd className="font-display text-2xl font-bold">{score}</dd>
          </div>
          <div className="rounded-xl bg-[#F2E3BF] px-3 py-2">
            <dt className="text-[#7A4F17]">{t("survival.puzzlesSolved")}</dt>
            <dd className="font-display text-2xl font-bold">{solved}</dd>
          </div>
        </dl>
        {best && !newBest && <p className="text-sm text-[#5A3A22]">{t("survival.best", { score: best.score, solved: best.solved })}</p>}
      </GameDialog>

      <OptionsModal open={optionsOpen} onClose={() => setOptionsOpen(false)} />
      <DragLayer />
    </main>
  );
}
