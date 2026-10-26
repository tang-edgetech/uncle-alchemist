export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GridLines {
  regionEdges: Segment[];
  cellEdges: Segment[];
}

export function gridLines(size: number, regions: number[]): GridLines {
  const regionEdges: Segment[] = [];
  const cellEdges: Segment[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = row * size + col;
      if (col + 1 < size) {
        const edge = { x1: col + 1, y1: row, x2: col + 1, y2: row + 1 };
        (regions[cell] === regions[cell + 1] ? cellEdges : regionEdges).push(edge);
      }
      if (row + 1 < size) {
        const edge = { x1: col, y1: row + 1, x2: col + 1, y2: row + 1 };
        (regions[cell] === regions[cell + size] ? cellEdges : regionEdges).push(edge);
      }
    }
  }
  return { regionEdges, cellEdges };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function cageBox(size: number, cells: number[], inset: number): Rect | null {
  const rows = cells.map((cell) => Math.floor(cell / size));
  const cols = cells.map((cell) => cell % size);
  const top = Math.min(...rows);
  const left = Math.min(...cols);
  const height = Math.max(...rows) - top + 1;
  const width = Math.max(...cols) - left + 1;
  if (width * height !== cells.length) return null;
  return { x: left + inset, y: top + inset, width: width - inset * 2, height: height - inset * 2 };
}

export function cageFill(size: number, cells: number[], inset: number): Rect[] {
  const members = new Set(cells);
  return cells.map((cell) => {
    const row = Math.floor(cell / size);
    const col = cell % size;
    const left = col > 0 && members.has(cell - 1) ? 0 : inset;
    const right = col < size - 1 && members.has(cell + 1) ? 0 : inset;
    const top = members.has(cell - size) ? 0 : inset;
    const bottom = members.has(cell + size) ? 0 : inset;
    return { x: col + left, y: row + top, width: 1 - left - right, height: 1 - top - bottom };
  });
}

export function cageOutline(size: number, cells: number[], inset: number): Segment[] {
  const members = new Set(cells);
  const inCage = (row: number, col: number) => row >= 0 && col >= 0 && row < size && col < size && members.has(row * size + col);
  const segments: Segment[] = [];

  const span = (start: number, sideIn: boolean, diagonalIn: boolean, direction: -1 | 1) => {
    const edge = direction === -1 ? start : start + 1;
    if (!sideIn) return edge - direction * inset;
    return diagonalIn ? edge + direction * inset : edge;
  };

  for (const cell of cells) {
    const row = Math.floor(cell / size);
    const col = cell % size;
    if (!inCage(row - 1, col)) {
      const y = row + inset;
      segments.push({
        x1: span(col, inCage(row, col - 1), inCage(row - 1, col - 1), -1),
        y1: y,
        x2: span(col, inCage(row, col + 1), inCage(row - 1, col + 1), 1),
        y2: y,
      });
    }
    if (!inCage(row + 1, col)) {
      const y = row + 1 - inset;
      segments.push({
        x1: span(col, inCage(row, col - 1), inCage(row + 1, col - 1), -1),
        y1: y,
        x2: span(col, inCage(row, col + 1), inCage(row + 1, col + 1), 1),
        y2: y,
      });
    }
    if (!inCage(row, col - 1)) {
      const x = col + inset;
      segments.push({
        x1: x,
        y1: span(row, inCage(row - 1, col), inCage(row - 1, col - 1), -1),
        x2: x,
        y2: span(row, inCage(row + 1, col), inCage(row + 1, col - 1), 1),
      });
    }
    if (!inCage(row, col + 1)) {
      const x = col + 1 - inset;
      segments.push({
        x1: x,
        y1: span(row, inCage(row - 1, col), inCage(row - 1, col + 1), -1),
        x2: x,
        y2: span(row, inCage(row + 1, col), inCage(row + 1, col + 1), 1),
      });
    }
  }
  return segments;
}
