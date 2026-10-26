import { useEffect } from "react";
import { useGameStore } from "@/lib/stores/gameStore";

const TICK_MS = 250;

export function useGameClock() {
  const status = useGameStore((state) => state.status);
  const tick = useGameStore((state) => state.tick);
  const pause = useGameStore((state) => state.pause);

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      tick(now - last);
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [status, tick]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);
}
