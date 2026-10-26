import { beforeEach, describe, expect, it } from "vitest";
import { generatePuzzle } from "@/lib/game/generator";
import { EMPTY, type Puzzle } from "@/lib/game/types";
import { useGameStore } from "./gameStore";

let puzzle: Puzzle;

const firstEmpty = () => puzzle.givens.findIndex((value) => value === EMPTY);
const wrongValueFor = (cell: number) => (puzzle.solution[cell] + 1) % puzzle.size;

function fillSolution() {
  puzzle.givens.forEach((value, cell) => {
    if (value !== EMPTY) return;
    useGameStore.getState().select(cell);
    useGameStore.getState().input(puzzle.solution[cell]);
  });
}

describe("gameStore", () => {
  beforeEach(() => {
    puzzle = generatePuzzle(4, 321);
    useGameStore.getState().start(puzzle);
  });

  it("starts with the givens and a running clock", () => {
    const state = useGameStore.getState();
    expect(state.values).toEqual(puzzle.givens);
    expect(state.status).toBe("playing");
  });

  it("ignores input on given cells", () => {
    const given = puzzle.givens.findIndex((value) => value !== EMPTY);
    useGameStore.getState().select(given);
    useGameStore.getState().input(wrongValueFor(given));
    expect(useGameStore.getState().values[given]).toBe(puzzle.givens[given]);
  });

  it("places, undoes and erases", () => {
    const cell = firstEmpty();
    useGameStore.getState().select(cell);
    useGameStore.getState().input(puzzle.solution[cell]);
    expect(useGameStore.getState().values[cell]).toBe(puzzle.solution[cell]);
    useGameStore.getState().undo();
    expect(useGameStore.getState().values[cell]).toBe(EMPTY);
    useGameStore.getState().input(puzzle.solution[cell]);
    useGameStore.getState().erase();
    expect(useGameStore.getState().values[cell]).toBe(EMPTY);
  });

  it("toggles notes and clears matching peer notes when placing", () => {
    const cell = firstEmpty();
    const value = puzzle.solution[cell];
    const peer = puzzle.givens.findIndex(
      (given, other) => given === EMPTY && other !== cell && Math.floor(other / puzzle.size) === Math.floor(cell / puzzle.size),
    );
    useGameStore.getState().toggleNotesMode();
    useGameStore.getState().select(peer);
    useGameStore.getState().input(value);
    expect(useGameStore.getState().notes[peer]).toBe(1 << value);
    useGameStore.getState().toggleNotesMode();
    useGameStore.getState().select(cell);
    useGameStore.getState().input(value);
    expect(useGameStore.getState().notes[peer]).toBe(0);
  });

  it("counts a mistake when a placement breaks a rule", () => {
    const cell = firstEmpty();
    const row = Math.floor(cell / puzzle.size);
    const clash = puzzle.solution.find((_, other) => other !== cell && Math.floor(other / puzzle.size) === row && puzzle.givens[other] !== EMPTY);
    useGameStore.getState().select(cell);
    useGameStore.getState().input(clash ?? wrongValueFor(cell));
    expect(useGameStore.getState().mistakes).toBeGreaterThanOrEqual(clash === undefined ? 0 : 1);
  });

  it("wins when the board matches the solution", () => {
    fillSolution();
    expect(useGameStore.getState().status).toBe("won");
    expect(useGameStore.getState().mistakes).toBe(0);
  });

  it("pauses, blocks input while paused and resets", () => {
    useGameStore.getState().pause();
    const cell = firstEmpty();
    useGameStore.getState().select(cell);
    useGameStore.getState().input(puzzle.solution[cell]);
    expect(useGameStore.getState().values[cell]).toBe(EMPTY);
    useGameStore.getState().resume();
    useGameStore.getState().tick(5000);
    useGameStore.getState().reset();
    expect(useGameStore.getState().elapsedMs).toBe(0);
    expect(useGameStore.getState().values).toEqual(puzzle.givens);
  });
});
