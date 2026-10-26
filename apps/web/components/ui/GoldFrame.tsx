import type { ReactNode } from "react";

interface GoldFrameProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: "wood" | "parchment";
}

const TONES = {
  wood: "bg-[linear-gradient(180deg,#5A3A22,#3E2615)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] text-cream",
  parchment: "bg-parchment text-ink",
};

export function GoldFrame({ children, className = "", innerClassName = "", tone = "wood" }: GoldFrameProps) {
  return (
    <div className={`rounded-[26px] bg-gold p-[6px] shadow-[0_5px_0_#4A2F0C,0_14px_26px_rgba(0,0,0,0.5)] ${className}`}>
      <div className={`rounded-[20px] ${TONES[tone]} ${innerClassName}`}>{children}</div>
    </div>
  );
}
