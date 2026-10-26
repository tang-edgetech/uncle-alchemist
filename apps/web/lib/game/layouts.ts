import type { GridSize } from "./types";
import type { Rng } from "./rng";

const JIGSAW_LAYOUTS: Partial<Record<GridSize, string[][]>> = {
  5: [
    ["00011", "00111", "22333", "22433", "24444"],
    ["00111", "02211", "02233", "02433", "44443"],
  ],
  7: [
    ["0000111", "0001111", "2222333", "2224333", "5544366", "5544466", "5554666"],
  ],
};

function boxLayout(size: GridSize, boxRows: number, boxCols: number): number[] {
  const regions: number[] = [];
  const boxesPerRow = size / boxCols;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      regions.push(Math.floor(row / boxRows) * boxesPerRow + Math.floor(col / boxCols));
    }
  }
  return regions;
}

function parseLayout(rows: string[]): number[] {
  return rows.flatMap((row) => row.split("").map(Number));
}

function transform(regions: number[], size: number, variant: number): number[] {
  const result = new Array<number>(size * size);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let targetRow = row;
      let targetCol = col;
      if (variant & 1) targetCol = size - 1 - targetCol;
      if (variant & 2) targetRow = size - 1 - targetRow;
      if (variant & 4) [targetRow, targetCol] = [targetCol, targetRow];
      result[targetRow * size + targetCol] = regions[row * size + col];
    }
  }
  return result;
}

export function jigsawLayouts(size: GridSize): number[][] {
  return (JIGSAW_LAYOUTS[size] ?? []).map(parseLayout);
}

export function pickRegions(size: GridSize, rng: Rng): number[] {
  if (size === 4) return boxLayout(4, 2, 2);
  if (size === 6) return boxLayout(6, 2, 3);
  const layouts = jigsawLayouts(size);
  const layout = layouts[Math.floor(rng() * layouts.length)];
  return transform(layout, size, Math.floor(rng() * 8));
}
