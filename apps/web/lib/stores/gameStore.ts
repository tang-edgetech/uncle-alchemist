import { create } from "zustand";
import { findConflicts, isBoardFull, isSolved, peersOf } from "@/lib/game/rules";
import { EMPTY, type Puzzle } from "@/lib/game/types";

export type GameStatus = "idle" | "playing" | "paused" | "won";

export type GameFeedback = "notQuite" | null;

interface CellSnapshot {
  cell: number;
  value: number;
  notes: number;
}

interface GameState {
  puzzle: Puzzle | null;
  values: number[];
  notes: number[];
  selected: number | null;
  notesMode: boolean;
  history: CellSnapshot[][];
  mistakes: number;
  elapsedMs: number;
  status: GameStatus;
  feedback: GameFeedback;
  start: (puzzle: Puzzle) => void;
  select: (cell: number | null) => void;
  moveSelection: (rowDelta: number, colDelta: number) => void;
  input: (value: number) => void;
  erase: () => void;
  undo: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: (deltaMs: number) => void;
  toggleNotesMode: () => void;
  clearFeedback: () => void;
}

const snapshotOf = (state: Pick<GameState, "values" | "notes">, cell: number): CellSnapshot => ({
  cell,
  value: state.values[cell],
  notes: state.notes[cell],
});

const isGiven = (puzzle: Puzzle, cell: number) => puzzle.givens[cell] !== EMPTY;

export const useGameStore = create<GameState>()((set, get) => ({
  puzzle: null,
  values: [],
  notes: [],
  selected: null,
  notesMode: false,
  history: [],
  mistakes: 0,
  elapsedMs: 0,
  status: "idle",
  feedback: null,

  start: (puzzle) =>
    set({
      puzzle,
      values: [...puzzle.givens],
      notes: new Array(puzzle.size * puzzle.size).fill(0),
      selected: null,
      notesMode: false,
      history: [],
      mistakes: 0,
      elapsedMs: 0,
      status: "playing",
      feedback: null,
    }),

  select: (cell) => {
    if (get().status !== "playing") return;
    set({ selected: cell });
  },

  moveSelection: (rowDelta, colDelta) => {
    const { puzzle, selected, status } = get();
    if (!puzzle || status !== "playing") return;
    const size = puzzle.size;
    const current = selected ?? 0;
    const row = (Math.floor(current / size) + rowDelta + size) % size;
    const col = ((current % size) + colDelta + size) % size;
    set({ selected: selected === null ? 0 : row * size + col });
  },

  input: (value) => {
    const state = get();
    const { puzzle, selected, status } = state;
    if (!puzzle || selected === null || status !== "playing" || isGiven(puzzle, selected)) return;

    if (state.notesMode) {
      if (state.values[selected] !== EMPTY) return;
      const notes = [...state.notes];
      notes[selected] ^= 1 << value;
      set({ notes, history: [...state.history, [snapshotOf(state, selected)]] });
      return;
    }

    if (state.values[selected] === value) {
      get().erase();
      return;
    }

    const bit = 1 << value;
    const touchedPeers = peersOf(puzzle, selected).filter((peer) => state.notes[peer] & bit);
    const snapshots = [snapshotOf(state, selected), ...touchedPeers.map((peer) => snapshotOf(state, peer))];
    const values = [...state.values];
    const notes = [...state.notes];
    values[selected] = value;
    notes[selected] = 0;
    touchedPeers.forEach((peer) => (notes[peer] &= ~bit));

    let mistakes = state.mistakes;
    if (findConflicts(puzzle, values).has(selected)) mistakes++;

    let nextStatus: GameStatus = state.status;
    let feedback: GameFeedback = null;
    if (isBoardFull(values)) {
      if (isSolved(puzzle, values)) {
        nextStatus = "won";
      } else {
        mistakes++;
        feedback = "notQuite";
      }
    }

    set({
      values,
      notes,
      mistakes,
      status: nextStatus,
      feedback,
      selected: nextStatus === "won" ? null : selected,
      history: [...state.history, snapshots],
    });
  },

  erase: () => {
    const state = get();
    const { puzzle, selected, status } = state;
    if (!puzzle || selected === null || status !== "playing" || isGiven(puzzle, selected)) return;
    if (state.values[selected] === EMPTY && state.notes[selected] === 0) return;
    const values = [...state.values];
    const notes = [...state.notes];
    values[selected] = EMPTY;
    notes[selected] = 0;
    set({ values, notes, feedback: null, history: [...state.history, [snapshotOf(state, selected)]] });
  },

  undo: () => {
    const state = get();
    if (state.status !== "playing" || state.history.length === 0) return;
    const history = [...state.history];
    const snapshots = history.pop() ?? [];
    const values = [...state.values];
    const notes = [...state.notes];
    snapshots.forEach((snapshot) => {
      values[snapshot.cell] = snapshot.value;
      notes[snapshot.cell] = snapshot.notes;
    });
    set({ values, notes, history, feedback: null, selected: snapshots[0]?.cell ?? state.selected });
  },

  reset: () => {
    const { puzzle } = get();
    if (puzzle) get().start(puzzle);
  },

  pause: () => {
    if (get().status === "playing") set({ status: "paused" });
  },

  resume: () => {
    if (get().status === "paused") set({ status: "playing" });
  },

  stop: () => {
    const { status } = get();
    if (status === "playing" || status === "paused") set({ status: "idle", selected: null });
  },

  tick: (deltaMs) => {
    if (get().status === "playing") set((state) => ({ elapsedMs: state.elapsedMs + deltaMs }));
  },

  toggleNotesMode: () => set((state) => ({ notesMode: !state.notesMode })),

  clearFeedback: () => set({ feedback: null }),
}));
