"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { useT } from "@/lib/i18n/translate";
import { OptionsPanel } from "./OptionsPanel";

interface OptionsModalProps {
  open: boolean;
  onClose: () => void;
}

export function OptionsModal({ open, onClose }: OptionsModalProps) {
  const t = useT();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-full w-full max-w-md flex-col rounded-[26px] bg-gold p-[6px] shadow-[0_6px_0_#4A2F0C,0_20px_40px_rgba(0,0,0,0.55)]"
          >
            <div className="flex min-h-0 flex-col gap-4 rounded-[20px] bg-[linear-gradient(180deg,#5A3A22,#3E2615)] p-5">
              <h2 id={titleId} className="text-center font-display text-2xl font-bold text-gold-light">
                {t("options.title")}
              </h2>
              <div className="min-h-0 overflow-y-auto">
                <OptionsPanel allowReset={false} />
              </div>
              <GoldButton onClick={onClose}>{t("options.close")}</GoldButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
