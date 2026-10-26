"use client";

import { AnimatePresence, motion } from "motion/react";

type Tone = "danger" | "success";

const TONES: Record<Tone, string> = {
  danger: "bg-[#B8340F] text-white",
  success: "bg-[#1F6E6A] text-white",
};

interface FloatingBannerProps {
  message: string | null;
  tone: Tone;
}

export function FloatingBanner({ message, tone }: FloatingBannerProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          key={message}
          role="status"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute inset-x-6 -top-1 z-40 rounded-full px-4 py-2 text-center text-sm font-bold shadow-lg ${TONES[tone]}`}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
