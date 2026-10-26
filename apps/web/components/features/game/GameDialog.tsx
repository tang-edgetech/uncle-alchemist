"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface GameDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  onDismiss?: () => void;
}

export function GameDialog({ open, title, children, actions, onDismiss }: GameDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const firstButton = panelRef.current?.querySelector<HTMLElement>("button, a");
    firstButton?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onDismiss) {
        event.stopPropagation();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-[26px] bg-gold p-[6px] shadow-[0_6px_0_#4A2F0C,0_20px_40px_rgba(0,0,0,0.55)]"
          >
            <div className="flex flex-col gap-4 rounded-[20px] bg-parchment px-6 py-6 text-center text-ink">
              <h2 id={titleId} className="font-display text-2xl font-bold">
                {title}
              </h2>
              {children}
              <div className="flex flex-col gap-3">{actions}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
