import { describe, expect, it } from "vitest";
import { COMPOUNDS, ingredientIndexes } from "./elements";
import { toSolverCages } from "./generator";
import { findConflicts } from "./rules";
import { countSolutions } from "./solver";
import { buildChallenge, challengeFor, TEMPLATES, templatesFor } from "./templates";
import { EMPTY, type GridSize } from "./types";

const SIZES: GridSize[] = [4, 5, 6, 7];
const SEEDS = [1, 2, 3, 99, 2024, 777777];

describe("templates", () => {
  it.each(SIZES)("has at least 6 frames for %ix%i", (size) => {
    expect(templatesFor(size).length).toBeGreaterThanOrEqual(6);
  });

  it("uses unique ids", () => {
    const ids = TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(TEMPLATES.map((template) => [template.id, template] as const))("%s stays valid and unique under element swaps", (_, template) => {
    for (const seed of SEEDS) {
      const puzzle = buildChallenge(template, seed);
      expect(puzzle.templateId).toBe(template.id);
      expect(findConflicts(puzzle, puzzle.solution).size).toBe(0);
      for (const cage of puzzle.cages) {
        expect(COMPOUNDS[cage.compound].ingredients).toHaveLength(cage.cells.length);
        const values = cage.cells.map((cell) => puzzle.solution[cell]).sort();
        expect(values).toEqual([...ingredientIndexes(cage.compound)].sort());
      }
      puzzle.givens.forEach((value, cell) => {
        if (value !== EMPTY) expect(value).toBe(puzzle.solution[cell]);
      });
      const unique = countSolutions({ size: puzzle.size, regions: puzzle.regions, cages: toSolverCages(puzzle.cages), values: puzzle.givens });
      expect(unique).toBe(1);
    }
  });

  it("keeps the frame fixed and only swaps elements", () => {
    const template = templatesFor(5)[0];
    const first = buildChallenge(template, 11);
    const second = buildChallenge(template, 12);
    expect(first.regions).toEqual(second.regions);
    expect(first.cages.map((cage) => cage.cells)).toEqual(second.cages.map((cage) => cage.cells));
    expect(first.givens.map((value) => value === EMPTY)).toEqual(second.givens.map((value) => value === EMPTY));
  });

  it("picks a requested template by id", () => {
    expect(challengeFor(6, 5, "6-03").templateId).toBe("6-03");
  });
});
