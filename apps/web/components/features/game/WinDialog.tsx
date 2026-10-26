"use client";

import { motion } from "motion/react";
import { GameIcon } from "@/components/ui/GameIcon";
import { GoldButton } from "@/components/ui/GoldButton";
import { formatClock } from "@/lib/game/scoring";
import { useT } from "@/lib/i18n/translate";
import { GameDialog } from "./GameDialog";

interface WinDialogProps {
  open: boolean;
  stars: number;
  seconds: number;
  mistakes: number;
  notice?: string;
  nextHref?: string;
  onReplay: () => void;
  menuHref: string;
}

const STAR_SLOTS = [0, 1, 2];

export function WinDialog({ open, stars, seconds, mistakes, notice, nextHref, onReplay, menuHref }: WinDialogProps) {
  const t = useT();
  return (
    <GameDialog
      open={open}
      title={t("game.solved")}
      actions={
        <>
          {nextHref && <GoldButton href={nextHref}>{t("game.nextStage")}</GoldButton>}
          <GoldButton variant={nextHref ? "secondary" : "primary"} onClick={onReplay}>
            {t("game.replay")}
          </GoldButton>
          <GoldButton href={menuHref} variant="secondary">
            {t("game.stagesMenu")}
          </GoldButton>
        </>
      }
    >
      <div className="flex items-end justify-center gap-2" role="img" aria-label={t("game.starsLabel", { count: stars })}>
        {STAR_SLOTS.map((slot) => (
          <motion.span
            key={slot}
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + slot * 0.18, type: "spring", stiffness: 300, damping: 12 }}
            className={slot === 1 ? "-translate-y-3" : ""}
          >
            <GameIcon
              name="star"
              filled
              className={`h-14 w-14 drop-shadow-[0_3px_0_#7A4F17] ${slot < stars ? "text-[#FFC93C]" : "text-[#D8CBB0]"}`}
            />
          </motion.span>
        ))}
      </div>
      {notice && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="rounded-xl bg-[#1F6E6A] px-3 py-2 text-sm font-bold text-white"
        >
          {notice}
        </motion.p>
      )}
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-[#F2E3BF] px-3 py-2">
          <dt className="text-[#7A4F17]">{t("game.time")}</dt>
          <dd className="font-display text-xl font-bold">{formatClock(seconds)}</dd>
        </div>
        <div className="rounded-xl bg-[#F2E3BF] px-3 py-2">
          <dt className="text-[#7A4F17]">{t("game.mistakes")}</dt>
          <dd className="font-display text-xl font-bold">{mistakes}</dd>
        </div>
      </dl>
    </GameDialog>
  );
}
