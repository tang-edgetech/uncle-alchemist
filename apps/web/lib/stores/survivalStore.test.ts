import { beforeEach, describe, expect, it } from "vitest";
import {
  isBetter,
  MISTAKE_PENALTY_SECONDS,
  pointsForSolve,
  sizeForRound,
  SURVIVAL_LIVES,
  SURVIVAL_START_SECONDS,
  TIME_BONUS_SECONDS,
} from "@/lib/game/survival";
import { useSurvivalStore } from "./survivalStore";

const store = () => useSurvivalStore.getState();

describe("survival rules", () => {
  it("grows the board every three puzzles and stays at 7x7", () => {
    expect([0, 2, 3, 5, 6, 8, 9, 30].map(sizeForRound)).toEqual([4, 4, 5, 5, 6, 6, 7, 7]);
  });

  it("scores size squared times ten plus a speed bonus", () => {
    expect(pointsForSolve(4, 20)).toBe(160 + 40);
    expect(pointsForSolve(5, 500)).toBe(250);
  });

  it("compares best results by score, then puzzles solved", () => {
    expect(isBetter({ score: 100, solved: 1 }, null)).toBe(true);
    expect(isBetter({ score: 0, solved: 0 }, null)).toBe(false);
    expect(isBetter({ score: 100, solved: 2 }, { score: 100, solved: 1 })).toBe(true);
    expect(isBetter({ score: 90, solved: 5 }, { score: 100, solved: 1 })).toBe(false);
  });
});

describe("survivalStore", () => {
  beforeEach(() => store().begin());

  it("starts a run with full lives and the starting clock", () => {
    expect(store().phase).toBe("playing");
    expect(store().lives).toBe(SURVIVAL_LIVES);
    expect(store().timeLeftMs).toBe(SURVIVAL_START_SECONDS * 1000);
  });

  it("ends the run when the clock runs out", () => {
    store().tick(SURVIVAL_START_SECONDS * 1000);
    expect(store().phase).toBe("over");
    expect(store().endReason).toBe("time");
  });

  it("takes a life and time for each mistake, and ends at zero lives", () => {
    store().loseLife();
    expect(store().lives).toBe(SURVIVAL_LIVES - 1);
    expect(store().timeLeftMs).toBe((SURVIVAL_START_SECONDS - MISTAKE_PENALTY_SECONDS) * 1000);
    store().loseLife();
    store().loseLife();
    expect(store().phase).toBe("over");
    expect(store().endReason).toBe("lives");
  });

  it("adds points and time on a solve, then moves to the next round", () => {
    store().solve(30);
    expect(store().phase).toBe("between");
    expect(store().score).toBe(pointsForSolve(4, 30));
    expect(store().timeLeftMs).toBe((SURVIVAL_START_SECONDS + TIME_BONUS_SECONDS[4]) * 1000);
    store().tick(5000);
    expect(store().timeLeftMs).toBe((SURVIVAL_START_SECONDS + TIME_BONUS_SECONDS[4]) * 1000);
    store().advance();
    expect(store().phase).toBe("playing");
    expect(store().round).toBe(1);
  });

  it("ignores input once the run is over", () => {
    store().tick(SURVIVAL_START_SECONDS * 1000);
    store().solve(10);
    store().loseLife();
    expect(store().score).toBe(0);
    expect(store().lives).toBe(SURVIVAL_LIVES);
  });
});
