"use client";

import { GameIcon } from "@/components/ui/GameIcon";
import { GoldButton } from "@/components/ui/GoldButton";
import { useT } from "@/lib/i18n/translate";

interface PausedBoardProps {
  onResume: () => void;
  onOptions: () => void;
}

export function PausedBoard({ onResume, onOptions }: PausedBoardProps) {
  const t = useT();
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-[22px] bg-gold p-[7px] shadow-[0_6px_0_#4A2F0C,0_16px_30px_rgba(0,0,0,0.5)]">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-[linear-gradient(180deg,#5A3A22,#3E2615)] p-6 text-center text-cream">
        <h2 className="font-display text-3xl font-bold text-gold-light">{t("game.paused")}</h2>
        <p className="max-w-60 text-sm text-mist">{t("game.pausedHint")}</p>
        <GoldButton onClick={onResume}>{t("game.resume")}</GoldButton>
        <GoldButton variant="secondary" onClick={onOptions}>
          <GameIcon name="gear" className="h-5 w-5" />
          {t("game.options")}
        </GoldButton>
      </div>
    </div>
  );
}
