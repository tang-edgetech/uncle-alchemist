import { BASE_ORDER, COMPOUND_ORDER, COMPOUNDS } from "./elements";
import { createRng, shuffle } from "./rng";
import { buildChallenge, templatesFor } from "./templates";
import { EMPTY, type BaseKey, type Compound, type GridSize, type Puzzle } from "./types";

export interface World {
  id: number;
  key: "workshop" | "greenhouse" | "observatory" | "cellar";
  size: GridSize;
  stageCount: number;
  starsToUnlock: number;
  maxExtraGivens: number;
}

export const WORLDS: World[] = [
  { id: 1, key: "workshop", size: 4, stageCount: 10, starsToUnlock: 0, maxExtraGivens: 3 },
  { id: 2, key: "greenhouse", size: 5, stageCount: 10, starsToUnlock: 12, maxExtraGivens: 6 },
  { id: 3, key: "observatory", size: 6, stageCount: 10, starsToUnlock: 15, maxExtraGivens: 8 },
  { id: 4, key: "cellar", size: 7, stageCount: 10, starsToUnlock: 18, maxExtraGivens: 10 },
];

export const MAX_STARS_PER_STAGE = 3;

const STAGE_SEED_FACTOR = 7919;

export type StarRecord = Record<string, number>;

export function stageId(worldId: number, stageIndex: number): string {
  return `${worldId}-${String(stageIndex + 1).padStart(2, "0")}`;
}

export function parseStageId(id: string): { world: World; stageIndex: number } | null {
  const match = /^(\d)-(\d{2})$/.exec(id);
  if (!match) return null;
  const world = WORLDS.find((candidate) => candidate.id === Number(match[1]));
  const stageIndex = Number(match[2]) - 1;
  if (!world || stageIndex < 0 || stageIndex >= world.stageCount) return null;
  return { world, stageIndex };
}

export function stageIdsOf(world: World): string[] {
  return Array.from({ length: world.stageCount }, (_, index) => stageId(world.id, index));
}

export function allStageIds(): string[] {
  return WORLDS.flatMap(stageIdsOf);
}

export function worldStars(world: World, stars: StarRecord): number {
  return stageIdsOf(world).reduce((total, id) => total + (stars[id] ?? 0), 0);
}

export function isWorldUnlocked(world: World, stars: StarRecord): boolean {
  const previous = WORLDS.find((candidate) => candidate.id === world.id - 1);
  if (!previous) return true;
  return isWorldUnlocked(previous, stars) && worldStars(previous, stars) >= world.starsToUnlock;
}

export const SURVIVAL_UNLOCK_WORLD_ID = 2;

export function isSurvivalUnlocked(stars: StarRecord): boolean {
  const world = WORLDS.find((candidate) => candidate.id === SURVIVAL_UNLOCK_WORLD_ID);
  return world ? isWorldUnlocked(world, stars) : true;
}

export function isStageUnlocked(id: string, stars: StarRecord): boolean {
  const parsed = parseStageId(id);
  if (!parsed || !isWorldUnlocked(parsed.world, stars)) return false;
  if (parsed.stageIndex === 0) return true;
  return (stars[stageId(parsed.world.id, parsed.stageIndex - 1)] ?? 0) > 0;
}

export function nextStageId(id: string): string | null {
  const parsed = parseStageId(id);
  if (!parsed) return null;
  if (parsed.stageIndex + 1 < parsed.world.stageCount) return stageId(parsed.world.id, parsed.stageIndex + 1);
  const nextWorld = WORLDS.find((candidate) => candidate.id === parsed.world.id + 1);
  return nextWorld ? stageId(nextWorld.id, 0) : null;
}

export function extraGivensFor(world: World, stageIndex: number): number {
  if (world.stageCount <= 1) return 0;
  return Math.round(world.maxExtraGivens * (1 - stageIndex / (world.stageCount - 1)));
}

export function stagePuzzle(id: string): Puzzle {
  const parsed = parseStageId(id);
  if (!parsed) throw new Error(`Unknown stage ${id}`);
  const { world, stageIndex } = parsed;
  const templates = templatesFor(world.size);
  const seed = world.id * 100000 + (stageIndex + 1) * STAGE_SEED_FACTOR;
  const puzzle = buildChallenge(templates[stageIndex % templates.length], seed);
  const emptyCells = puzzle.givens.flatMap((value, cell) => (value === EMPTY ? [cell] : []));
  const revealed = shuffle(emptyCells, createRng(seed + 1)).slice(0, extraGivensFor(world, stageIndex));
  const givens = [...puzzle.givens];
  revealed.forEach((cell) => (givens[cell] = puzzle.solution[cell]));
  return { ...puzzle, stageId: id, givens };
}

export interface RecipeChapter {
  world: World;
  newBases: BaseKey[];
  newCompounds: Compound[];
}

const FIRST_SIZE_WITH_PAIR_CAGES: GridSize = 5;
const FIRST_SIZE_WITH_TRIPLE_CAGES: GridSize = 7;

function canAppearIn(compound: Compound, world: World): boolean {
  const minimumSize = compound.tier === 2 ? FIRST_SIZE_WITH_TRIPLE_CAGES : FIRST_SIZE_WITH_PAIR_CAGES;
  const available = BASE_ORDER.slice(0, world.size);
  return world.size >= minimumSize && compound.ingredients.every((ingredient) => available.includes(ingredient));
}

export function firstWorldOf(compound: Compound): World | undefined {
  return WORLDS.find((world) => canAppearIn(compound, world));
}

export function recipeChapters(): RecipeChapter[] {
  const compounds = COMPOUND_ORDER.map((key) => COMPOUNDS[key]);
  return WORLDS.map((world, index) => ({
    world,
    newBases: BASE_ORDER.slice(index === 0 ? 0 : WORLDS[index - 1].size, world.size),
    newCompounds: compounds.filter((compound) => firstWorldOf(compound)?.id === world.id),
  }));
}
