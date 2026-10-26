import { BASE_ORDER, compoundFor } from "./elements";
import { createRng, shuffle } from "./rng";
import { EMPTY, type Cage, type GridSize, type Puzzle } from "./types";
import templateData from "./templates.json";

export interface BoardTemplate {
  id: string;
  size: GridSize;
  regions: string;
  solution: string;
  givens: string;
  cages: number[][];
}

const MAX_RELABEL_ATTEMPTS = 500;

export const TEMPLATES = templateData as BoardTemplate[];

export function templatesFor(size: GridSize): BoardTemplate[] {
  return TEMPLATES.filter((template) => template.size === size);
}

export function encodeDigits(values: number[]): string {
  return values.join("");
}

function decodeDigits(digits: string): number[] {
  return digits.split("").map(Number);
}

function relabelCages(cageCells: number[][], solution: number[]): Cage[] | null {
  const cages: Cage[] = [];
  for (const cells of cageCells) {
    const compound = compoundFor(cells.map((cell) => BASE_ORDER[solution[cell]]));
    if (!compound || compound.ingredients.length !== cells.length) return null;
    cages.push({ cells, compound: compound.key });
  }
  return cages;
}

export function buildChallenge(template: BoardTemplate, seed: number): Puzzle {
  const rng = createRng(seed);
  const baseSolution = decodeDigits(template.solution);
  const identity = Array.from({ length: template.size }, (_, index) => index);
  const givenMask = template.givens.split("").map((flag) => flag === "1");

  for (let attempt = 0; attempt <= MAX_RELABEL_ATTEMPTS; attempt++) {
    const mapping = attempt === MAX_RELABEL_ATTEMPTS ? identity : shuffle(identity, rng);
    const solution = baseSolution.map((value) => mapping[value]);
    const cages = relabelCages(template.cages, solution);
    if (!cages) continue;
    return {
      size: template.size,
      seed,
      templateId: template.id,
      regions: decodeDigits(template.regions),
      cages,
      givens: solution.map((value, cell) => (givenMask[cell] ? value : EMPTY)),
      solution,
    };
  }
  throw new Error(`Template ${template.id} has no valid labelling`);
}

export function challengeFor(size: GridSize, seed: number, templateId?: string): Puzzle {
  const templates = templatesFor(size);
  const chosen = templates.find((template) => template.id === templateId) ?? templates[Math.floor(createRng(seed ^ 0x5f3759df)() * templates.length)];
  return buildChallenge(chosen, seed);
}
