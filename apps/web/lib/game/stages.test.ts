import { describe, expect, it } from "vitest";
import { COMPOUND_ORDER } from "./elements";
import { toSolverCages } from "./generator";
import { findConflicts } from "./rules";
import { countSolutions } from "./solver";
import {
  allStageIds,
  extraGivensFor,
  isStageUnlocked,
  isWorldUnlocked,
  nextStageId,
  parseStageId,
  recipeChapters,
  stageId,
  stageIdsOf,
  stagePuzzle,
  WORLDS,
  type StarRecord,
} from "./stages";
import { EMPTY } from "./types";

const fullStars = (worldIndex: number, starsEach: number): StarRecord =>
  Object.fromEntries(stageIdsOf(WORLDS[worldIndex]).map((id) => [id, starsEach]));

describe("stage puzzles", () => {
  it.each(allStageIds())("stage %s is valid, unique and stable", (id) => {
    const puzzle = stagePuzzle(id);
    expect(findConflicts(puzzle, puzzle.solution).size).toBe(0);
    puzzle.givens.forEach((value, cell) => {
      if (value !== EMPTY) expect(value).toBe(puzzle.solution[cell]);
    });
    expect(countSolutions({ size: puzzle.size, regions: puzzle.regions, cages: toSolverCages(puzzle.cages), values: puzzle.givens })).toBe(1);
    expect(stagePuzzle(id)).toEqual(puzzle);
  });

  it("gives early stages more help than late stages", () => {
    for (const world of WORLDS) {
      expect(extraGivensFor(world, 0)).toBe(world.maxExtraGivens);
      expect(extraGivensFor(world, world.stageCount - 1)).toBe(0);
      const first = stagePuzzle(stageId(world.id, 0)).givens.filter((value) => value !== EMPTY).length;
      const last = stagePuzzle(stageId(world.id, world.stageCount - 1)).givens.filter((value) => value !== EMPTY).length;
      expect(first).toBeGreaterThan(last);
    }
  });
});

describe("unlocking", () => {
  it("starts with only the first stage open", () => {
    expect(isStageUnlocked("1-01", {})).toBe(true);
    expect(isStageUnlocked("1-02", {})).toBe(false);
    expect(isWorldUnlocked(WORLDS[1], {})).toBe(false);
  });

  it("opens the next stage after any stars on the previous one", () => {
    expect(isStageUnlocked("1-02", { "1-01": 1 })).toBe(true);
    expect(isStageUnlocked("1-03", { "1-01": 3 })).toBe(false);
  });

  it("needs enough stars in the previous world to open a world", () => {
    const justShort = { ...fullStars(0, 1), "1-01": 2 };
    expect(isWorldUnlocked(WORLDS[1], fullStars(0, 1))).toBe(false);
    expect(isWorldUnlocked(WORLDS[1], justShort)).toBe(false);
    expect(isWorldUnlocked(WORLDS[1], fullStars(0, 2))).toBe(true);
    expect(isStageUnlocked("2-01", fullStars(0, 2))).toBe(true);
  });

  it("requires every earlier world to be open as well", () => {
    expect(isWorldUnlocked(WORLDS[2], fullStars(1, 3))).toBe(false);
    expect(isWorldUnlocked(WORLDS[2], { ...fullStars(0, 2), ...fullStars(1, 2) })).toBe(true);
  });

  it("parses ids and finds the next stage across worlds", () => {
    expect(parseStageId("2-10")?.stageIndex).toBe(9);
    expect(parseStageId("5-01")).toBeNull();
    expect(nextStageId("1-10")).toBe("2-01");
    expect(nextStageId("4-10")).toBeNull();
  });
});

describe("recipe chapters", () => {
  it("lists every compound exactly once, in the first world it can appear", () => {
    const chapters = recipeChapters();
    const listed = chapters.flatMap((chapter) => chapter.newCompounds.map((compound) => compound.key));
    expect([...listed].sort()).toEqual([...COMPOUND_ORDER].sort());
    expect(chapters.map((chapter) => chapter.newCompounds.length)).toEqual([0, 10, 5, 16]);
    expect(chapters.map((chapter) => chapter.newBases)).toEqual([["wind", "water", "soil", "fire"], ["nature"], ["light"], ["shadow"]]);
  });
});
