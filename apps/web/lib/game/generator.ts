import { BASE_ORDER, compoundFor, ingredientIndexes } from "./elements";
import { pickRegions } from "./layouts";
import { createRng, shuffle, type Rng } from "./rng";
import { countSolutions, solveRandom, type SolverCage } from "./solver";
import { EMPTY, type Cage, type GridSize, type Puzzle } from "./types";

interface SizeRules {
  pairs: number;
  triples: number;
  minGivens: number;
}

export const SIZE_RULES: Record<GridSize, SizeRules> = {
  4: { pairs: 0, triples: 0, minGivens: 6 },
  5: { pairs: 4, triples: 0, minGivens: 4 },
  6: { pairs: 6, triples: 0, minGivens: 8 },
  7: { pairs: 7, triples: 2, minGivens: 10 },
};

const MAX_ATTEMPTS = 30;

export function toSolverCages(cages: Cage[]): SolverCage[] {
  return cages.map((cage) => ({
    cells: cage.cells,
    mask: ingredientIndexes(cage.compound).reduce((mask, index) => mask | (1 << index), 0),
  }));
}

function adjacentPairs(size: number): number[][] {
  const pairs: number[][] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = row * size + col;
      if (col + 1 < size) pairs.push([cell, cell + 1]);
      if (row + 1 < size) pairs.push([cell, cell + size]);
    }
  }
  return pairs;
}

function connectedTriples(size: number): number[][] {
  const triples: number[][] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = row * size + col;
      if (col + 2 < size) triples.push([cell, cell + 1, cell + 2]);
      if (row + 2 < size) triples.push([cell, cell + size, cell + 2 * size]);
      if (col + 1 < size && row + 1 < size) {
        const block = [cell, cell + 1, cell + size, cell + size + 1];
        block.forEach((skipped) => triples.push(block.filter((member) => member !== skipped)));
      }
    }
  }
  return triples;
}

function pickCages(size: GridSize, solution: number[], rng: Rng): Cage[] {
  const { pairs, triples } = SIZE_RULES[size];
  const used = new Set<number>();
  const cages: Cage[] = [];

  const tryAdd = (cells: number[], tier: 1 | 2) => {
    if (cells.some((cell) => used.has(cell))) return false;
    const values = cells.map((cell) => solution[cell]);
    if (new Set(values).size !== values.length) return false;
    const compound = compoundFor(values.map((value) => BASE_ORDER[value]));
    if (!compound || compound.tier !== tier) return false;
    cells.forEach((cell) => used.add(cell));
    cages.push({ cells: [...cells].sort((a, b) => a - b), compound: compound.key });
    return true;
  };

  let triplesAdded = 0;
  for (const cells of shuffle(connectedTriples(size), rng)) {
    if (triplesAdded >= triples) break;
    if (tryAdd(cells, 2)) triplesAdded++;
  }
  let pairsAdded = 0;
  for (const cells of shuffle(adjacentPairs(size), rng)) {
    if (pairsAdded >= pairs) break;
    if (tryAdd(cells, 1)) pairsAdded++;
  }
  return cages;
}

function carveGivens(size: GridSize, regions: number[], cages: Cage[], solution: number[], rng: Rng, minGivens: number): number[] {
  const givens = [...solution];
  const solverCages = toSolverCages(cages);
  const cageCells = new Set(cages.flatMap((cage) => cage.cells));
  const allCells = solution.map((_, cell) => cell);
  const order = [
    ...shuffle(allCells.filter((cell) => cageCells.has(cell)), rng),
    ...shuffle(allCells.filter((cell) => !cageCells.has(cell)), rng),
  ];
  let remaining = givens.length;
  for (const cell of order) {
    if (remaining <= minGivens) break;
    const kept = givens[cell];
    givens[cell] = EMPTY;
    if (countSolutions({ size, regions, cages: solverCages, values: givens }) === 1) {
      remaining--;
    } else {
      givens[cell] = kept;
    }
  }
  return givens;
}

export function generatePuzzle(size: GridSize, seed: number, minGivens = SIZE_RULES[size].minGivens): Puzzle {
  const rng = createRng(seed);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const regions = pickRegions(size, rng);
    const solution = solveRandom({ size, regions, cages: [], values: new Array(size * size).fill(EMPTY) }, rng);
    if (!solution) continue;
    const cages = pickCages(size, solution, rng);
    const givens = carveGivens(size, regions, cages, solution, rng, minGivens);
    return { size, seed, regions, cages, givens, solution };
  }
  throw new Error(`Unable to generate a ${size}x${size} puzzle for seed ${seed}`);
}
