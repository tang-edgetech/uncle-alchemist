import { ingredientIndexes } from "./elements";
import { EMPTY, type Puzzle } from "./types";

export function cageIndexByCell(puzzle: Puzzle): number[] {
  const lookup = new Array<number>(puzzle.size * puzzle.size).fill(-1);
  puzzle.cages.forEach((cage, cageIndex) => cage.cells.forEach((cell) => (lookup[cell] = cageIndex)));
  return lookup;
}

function markDuplicates(groups: Map<string, number[]>, values: number[], conflicts: Set<number>) {
  for (const cells of groups.values()) {
    const seen = new Map<number, number[]>();
    for (const cell of cells) {
      const value = values[cell];
      if (value === EMPTY) continue;
      seen.set(value, [...(seen.get(value) ?? []), cell]);
    }
    for (const sameValue of seen.values()) {
      if (sameValue.length > 1) sameValue.forEach((cell) => conflicts.add(cell));
    }
  }
}

export function findConflicts(puzzle: Puzzle, values: number[]): Set<number> {
  const { size, regions, cages } = puzzle;
  const conflicts = new Set<number>();
  const groups = new Map<string, number[]>();
  const addToGroup = (key: string, cell: number) => groups.set(key, [...(groups.get(key) ?? []), cell]);

  for (let cell = 0; cell < size * size; cell++) {
    addToGroup(`r${Math.floor(cell / size)}`, cell);
    addToGroup(`c${cell % size}`, cell);
    addToGroup(`g${regions[cell]}`, cell);
  }
  cages.forEach((cage, cageIndex) => cage.cells.forEach((cell) => addToGroup(`k${cageIndex}`, cell)));
  markDuplicates(groups, values, conflicts);

  for (const cage of cages) {
    const allowed = ingredientIndexes(cage.compound);
    for (const cell of cage.cells) {
      if (values[cell] !== EMPTY && !allowed.includes(values[cell])) conflicts.add(cell);
    }
  }
  return conflicts;
}

export function isBoardFull(values: number[]): boolean {
  return values.every((value) => value !== EMPTY);
}

export function isSolved(puzzle: Puzzle, values: number[]): boolean {
  return values.every((value, cell) => value === puzzle.solution[cell]);
}

export function peersOf(puzzle: Puzzle, cell: number): number[] {
  const { size, regions } = puzzle;
  const row = Math.floor(cell / size);
  const col = cell % size;
  const peers: number[] = [];
  for (let other = 0; other < size * size; other++) {
    if (other === cell) continue;
    if (Math.floor(other / size) === row || other % size === col || regions[other] === regions[cell]) peers.push(other);
  }
  return peers;
}
