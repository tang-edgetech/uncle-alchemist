import { create } from "zustand";

interface DragState {
  value: number | null;
  x: number;
  y: number;
  overCell: number | null;
  begin: (value: number, x: number, y: number) => void;
  move: (x: number, y: number, overCell: number | null) => void;
  end: () => void;
}

export const useDragStore = create<DragState>()((set) => ({
  value: null,
  x: 0,
  y: 0,
  overCell: null,
  begin: (value, x, y) => set({ value, x, y, overCell: null }),
  move: (x, y, overCell) => set({ x, y, overCell }),
  end: () => set({ value: null, overCell: null }),
}));
