import { shuffle, type Rng } from "./rng";
import { EMPTY } from "./types";

export interface SolverCage {
  cells: number[];
  mask: number;
}

export interface SolverInput {
  size: number;
  regions: number[];
  cages: SolverCage[];
  values: number[];
}

export interface SolverResult {
  count: number;
  solution: number[] | null;
}

function bitsOf(mask: number): number[] {
  const bits: number[] = [];
  for (let bit = 0; mask >> bit; bit++) {
    if ((mask >> bit) & 1) bits.push(bit);
  }
  return bits;
}

function popcount(mask: number): number {
  let count = 0;
  let remaining = mask;
  while (remaining) {
    remaining &= remaining - 1;
    count++;
  }
  return count;
}

export function searchSolutions(input: SolverInput, limit: number, rng?: Rng): SolverResult {
  const { size, regions, cages } = input;
  const cellCount = size * size;
  const fullMask = (1 << size) - 1;
  const values = [...input.values];
  const rowMask = new Array<number>(size).fill(0);
  const colMask = new Array<number>(size).fill(0);
  const regionMask = new Array<number>(size).fill(0);
  const cageUsed = new Array<number>(cages.length).fill(0);
  const cellCage = new Array<number>(cellCount).fill(-1);
  cages.forEach((cage, cageIndex) => cage.cells.forEach((cell) => (cellCage[cell] = cageIndex)));

  const place = (cell: number, value: number) => {
    const bit = 1 << value;
    rowMask[Math.floor(cell / size)] |= bit;
    colMask[cell % size] |= bit;
    regionMask[regions[cell]] |= bit;
    if (cellCage[cell] >= 0) cageUsed[cellCage[cell]] |= bit;
    values[cell] = value;
  };

  const unplace = (cell: number, value: number) => {
    const bit = ~(1 << value);
    rowMask[Math.floor(cell / size)] &= bit;
    colMask[cell % size] &= bit;
    regionMask[regions[cell]] &= bit;
    if (cellCage[cell] >= 0) cageUsed[cellCage[cell]] &= bit;
    values[cell] = EMPTY;
  };

  const candidatesOf = (cell: number) => {
    let mask = fullMask & ~rowMask[Math.floor(cell / size)] & ~colMask[cell % size] & ~regionMask[regions[cell]];
    const cageIndex = cellCage[cell];
    if (cageIndex >= 0) mask &= cages[cageIndex].mask & ~cageUsed[cageIndex];
    return mask;
  };

  for (let cell = 0; cell < cellCount; cell++) {
    const value = values[cell];
    if (value === EMPTY) continue;
    values[cell] = EMPTY;
    if (!((candidatesOf(cell) >> value) & 1)) return { count: 0, solution: null };
    place(cell, value);
  }

  let count = 0;
  let solution: number[] | null = null;

  const search = (): boolean => {
    let bestCell = -1;
    let bestMask = 0;
    let bestCount = Infinity;
    for (let cell = 0; cell < cellCount; cell++) {
      if (values[cell] !== EMPTY) continue;
      const mask = candidatesOf(cell);
      const options = popcount(mask);
      if (options < bestCount) {
        bestCell = cell;
        bestMask = mask;
        bestCount = options;
        if (options <= 1) break;
      }
    }
    if (bestCell === -1) {
      count++;
      if (!solution) solution = [...values];
      return count >= limit;
    }
    if (bestCount === 0) return false;
    const options = rng ? shuffle(bitsOf(bestMask), rng) : bitsOf(bestMask);
    for (const value of options) {
      place(bestCell, value);
      const done = search();
      unplace(bestCell, value);
      if (done) return true;
    }
    return false;
  };

  search();
  return { count, solution };
}

export function countSolutions(input: SolverInput, limit = 2): number {
  return searchSolutions(input, limit).count;
}

export function solveRandom(input: SolverInput, rng: Rng): number[] | null {
  return searchSolutions(input, 1, rng).solution;
}
