export type BaseKey = "wind" | "water" | "soil" | "fire" | "nature" | "light" | "shadow";

export type GridSize = 4 | 5 | 6 | 7;

export type MedallionMetal = "bronze" | "silver" | "gold";

export interface IconAccent {
  d: string;
  color: string;
  width: number;
}

export interface ElementArt {
  color: string;
  hi: string;
  lo: string;
  pale: boolean;
  icon: string;
  accents?: IconAccent[];
  sheen?: string;
}

export interface BaseElement extends ElementArt {
  key: BaseKey;
  introducedAt: GridSize;
}

export interface Compound extends ElementArt {
  key: string;
  tier: 1 | 2;
  ingredients: BaseKey[];
}

export interface Cage {
  cells: number[];
  compound: string;
}

export interface Puzzle {
  size: GridSize;
  seed: number;
  templateId?: string;
  stageId?: string;
  regions: number[];
  cages: Cage[];
  givens: number[];
  solution: number[];
}

export const EMPTY = -1;
