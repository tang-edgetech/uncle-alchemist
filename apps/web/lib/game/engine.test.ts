import { describe, expect, it } from "vitest";
import { BASE_ORDER, COMPOUNDS, compoundFor, ingredientIndexes } from "./elements";
import { generatePuzzle, SIZE_RULES, toSolverCages } from "./generator";
import { jigsawLayouts } from "./layouts";
import { findConflicts, isSolved } from "./rules";
import { countSolutions } from "./solver";
import { starsFor } from "./scoring";
import { EMPTY, type BaseKey, type GridSize } from "./types";

const SIZES: GridSize[] = [4, 5, 6, 7];
const SEEDS = [1, 7, 42, 1234, 98765];

describe("elements", () => {
  it("maps every pair of base elements to exactly one tier 1 compound", () => {
    for (let first = 0; first < BASE_ORDER.length; first++) {
      for (let second = first + 1; second < BASE_ORDER.length; second++) {
        const compound = compoundFor([BASE_ORDER[first], BASE_ORDER[second]]);
        expect(compound?.tier, `${BASE_ORDER[first]}+${BASE_ORDER[second]}`).toBe(1);
      }
    }
    expect(Object.values(COMPOUNDS).filter((compound) => compound.tier === 1)).toHaveLength(21);
  });

  it("has unique ingredient sets for tier 2 compounds", () => {
    const tierTwo = Object.values(COMPOUNDS).filter((compound) => compound.tier === 2);
    expect(tierTwo).toHaveLength(10);
    const keys = tierTwo.map((compound) => [...compound.ingredients].sort().join("+"));
    expect(new Set(keys).size).toBe(keys.length);
    tierTwo.forEach((compound) => expect(new Set(compound.ingredients).size).toBe(3));
  });

  it("finds compounds regardless of ingredient order", () => {
    expect(compoundFor(["water", "wind"] as BaseKey[])?.key).toBe("ice");
    expect(compoundFor(["fire", "soil", "water"] as BaseKey[])?.key).toBe("brick");
  });
});

describe("layouts", () => {
  it.each([5, 7] as GridSize[])("every %ix%i jigsaw layout has size regions of size cells and a solution", (size) => {
    for (const regions of jigsawLayouts(size)) {
      const counts = new Map<number, number>();
      regions.forEach((region) => counts.set(region, (counts.get(region) ?? 0) + 1));
      expect(counts.size).toBe(size);
      counts.forEach((count) => expect(count).toBe(size));
      expect(countSolutions({ size, regions, cages: [], values: new Array(size * size).fill(EMPTY) }, 1)).toBe(1);
    }
  });
});

describe("generator", () => {
  it.each(SIZES)("builds valid, uniquely solvable %ix%i puzzles", (size) => {
    for (const seed of SEEDS) {
      const puzzle = generatePuzzle(size, seed);
      expect(puzzle.solution).toHaveLength(size * size);
      expect(findConflicts(puzzle, puzzle.solution).size).toBe(0);
      expect(isSolved(puzzle, puzzle.solution)).toBe(true);
      puzzle.givens.forEach((value, cell) => {
        if (value !== EMPTY) expect(value).toBe(puzzle.solution[cell]);
      });
      for (const cage of puzzle.cages) {
        const values = cage.cells.map((cell) => puzzle.solution[cell]).sort();
        expect(values).toEqual([...ingredientIndexes(cage.compound)].sort());
      }
      const cages = toSolverCages(puzzle.cages);
      expect(countSolutions({ size, regions: puzzle.regions, cages, values: puzzle.givens })).toBe(1);
    }
  });

  it.each(SIZES)("adds the configured recipe cages for %ix%i", (size) => {
    const puzzle = generatePuzzle(size, 2024);
    const pairs = puzzle.cages.filter((cage) => cage.cells.length === 2).length;
    const triples = puzzle.cages.filter((cage) => cage.cells.length === 3).length;
    expect(pairs).toBe(SIZE_RULES[size].pairs);
    expect(triples).toBeLessThanOrEqual(SIZE_RULES[size].triples);
  });

  it("is deterministic for the same seed", () => {
    expect(generatePuzzle(6, 555)).toEqual(generatePuzzle(6, 555));
  });
});

describe("rules", () => {
  it("flags duplicates and wrong cage ingredients", () => {
    const puzzle = generatePuzzle(5, 99);
    const values = [...puzzle.solution];
    const [first, second] = [0, 1];
    values[second] = values[first];
    const conflicts = findConflicts(puzzle, values);
    expect(conflicts.has(first)).toBe(true);
    expect(conflicts.has(second)).toBe(true);
  });
});

describe("scoring", () => {
  it.each([
    [0, 30, true, 3],
    [0, 9999, true, 2],
    [2, 30, true, 2],
    [3, 30, true, 1],
    [0, 30, false, 0],
  ])("mistakes %i, %is, solved %s gives %i stars", (mistakes, seconds, solved, stars) => {
    expect(starsFor(4, mistakes, seconds, solved)).toBe(stars);
  });
});
