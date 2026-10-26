import type { BaseElement, BaseKey, Compound, ElementArt, GridSize, IconAccent, MedallionMetal } from "./types";

const HIGHLIGHT_MIX = 0.55;
const SHADOW_MIX = 0.55;
const PALE_LUMINANCE = 0.55;

function channels(hex: string): number[] {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}

function mix(hex: string, target: number, amount: number): string {
  return `#${channels(hex)
    .map((value) => Math.round(value + (target - value) * amount).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = channels(hex).map((value) => {
    const unit = value / 255;
    return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

interface ArtSpec {
  color: string;
  icon: string;
  accents?: IconAccent[];
  sheen?: string;
}

function art({ color, icon, accents, sheen }: ArtSpec): ElementArt {
  return {
    color,
    hi: mix(color, 255, HIGHLIGHT_MIX),
    lo: mix(color, 0, SHADOW_MIX),
    pale: relativeLuminance(color) > PALE_LUMINANCE,
    icon,
    accents,
    sheen,
  };
}

export const BASE_ORDER: BaseKey[] = ["wind", "water", "soil", "fire", "nature", "light", "shadow"];

const baseSpecs: Record<BaseKey, ArtSpec & { introducedAt: GridSize }> = {
  wind: { introducedAt: 4, color: "#24B7A1", icon: "M8 17 H28 A6 6 0 1 0 22 11 M8 25 H35 A6 6 0 1 1 29 31 M12 33 H22" },
  water: { introducedAt: 4, color: "#2C6AFF", icon: "M24 6 C24 6 12 19 12 29 A12 12 0 0 0 36 29 C36 19 24 6 24 6 Z" },
  soil: {
    introducedAt: 4,
    color: "#7C5B2A",
    icon: "M9 27 C8 18 15 10 24 10 C33 10 40 17 39 26 C38 35 31 40 23 40 C15 40 10 35 9 27 Z M17 20 V20.5 M28 17 V17.5 M31 28 V28.5 M19 31 V31.5 M25 24 V24.5 M13 26 C17 24 19 28 23 26",
  },
  fire: {
    introducedAt: 4,
    color: "#DC0000",
    icon: "M24 42 C15 42 10 35 12 28 C13 22 19 19 18 9 C26 13 32 20 31 27 C34 25 35 22 34 18 C39 23 40 31 37 35 C34 40 29 42 24 42 Z",
  },
  nature: {
    introducedAt: 5,
    color: "#09A930",
    icon: "M24 43 V25 M24 29 C23 19 16 14 7 15 C8 24 15 29 24 29 Z M24 25 C25 15 32 9 41 10 C40 19 33 25 24 25 Z M18 43 H30",
  },
  light: { introducedAt: 6, color: "#FFFDCC", icon: "M24 4 L28.5 19.5 L44 24 L28.5 28.5 L24 44 L19.5 28.5 L4 24 L19.5 19.5 Z" },
  shadow: {
    introducedAt: 7,
    color: "#4E229A",
    icon: "M30 8 A16 16 0 0 0 30 40 A20 20 0 0 1 30 8 Z M37 13 L38 16 L41 17 L38 18 L37 21 L36 18 L33 17 L36 16 Z",
  },
};

export const BASE_ELEMENTS = Object.fromEntries(
  BASE_ORDER.map((key) => {
    const { introducedAt, ...spec } = baseSpecs[key];
    return [key, { key, introducedAt, ...art(spec) }];
  }),
) as Record<BaseKey, BaseElement>;

const CAMPFIRE_LOGS = "M8 35 L40 43 M8 43 L40 35";

const compoundSpecs: (ArtSpec & { key: string; tier: 1 | 2; ingredients: BaseKey[] })[] = [
  { key: "ice", tier: 1, ingredients: ["wind", "water"], color: "#49E1FF", icon: "M24 6 L40 15 V33 L24 42 L8 33 V15 Z M8 15 L24 24 L40 15 M24 24 V42 M13 20 L18 23 M13 25 L16 27" },
  {
    key: "sand",
    tier: 1,
    ingredients: ["wind", "soil"],
    color: "#D3B597",
    icon: "M4 41 C11 35 19 35 26 40 C32 37 38 36 44 38 M21 38 V15 C21 10 28 10 28 15 V38 M21 26 H16 C14 26 13 25 13 23 V18 M28 29 H33 C35 29 36 28 36 26 V21",
  },
  { key: "lightning", tier: 1, ingredients: ["wind", "fire"], color: "#FFDC08", icon: "M28 5 L13 26 H24 L20 43 L35 21 H24 Z" },
  {
    key: "mud",
    tier: 1,
    ingredients: ["water", "soil"],
    color: "#3F2B15",
    icon: "M24 9 C27 9 27 14 30 14 C33 14 34 10 37 12 C40 14 36 18 38 21 C41 24 44 26 41 30 C38 33 34 30 32 34 C30 38 27 41 24 38 C21 35 18 38 15 36 C12 34 15 30 12 28 C8 26 6 22 10 20 C13 18 11 14 14 12 C17 10 21 9 24 9 Z M20 21 A2 2 0 1 1 20.01 21 M28 26 A2.5 2.5 0 1 1 28.01 26",
  },
  {
    key: "steam",
    tier: 1,
    ingredients: ["water", "fire"],
    color: "#D1DEE0",
    icon: "M16 40 C12 34 20 30 16 24 C12 18 20 14 16 8 M24 40 C20 34 28 30 24 24 C20 18 28 14 24 8 M32 40 C28 34 36 30 32 24 C28 18 36 14 32 8",
  },
  { key: "iron", tier: 1, ingredients: ["soil", "fire"], color: "#626062", icon: "M5 39 L9 31 H21 L25 39 Z M23 39 L27 31 H39 L43 39 Z M14 31 L18 23 H30 L34 31" },
  {
    key: "seed",
    tier: 1,
    ingredients: ["wind", "nature"],
    color: "#ACE43F",
    icon: "M24 38 V22 M24 22 L13 9 M24 22 L18 6 M24 22 V5 M24 22 L30 6 M24 22 L35 9 M24 44 C21 42 21 39 24 37 C27 39 27 42 24 44 Z",
  },
  {
    key: "tree",
    tier: 1,
    ingredients: ["water", "nature"],
    color: "#177D62",
    icon: "M21 44 V31 M27 44 V31 M16 44 H32 M24 4 C18 4 14 8 15 13 C10 14 7 19 9 24 C11 29 17 31 24 31 C31 31 37 29 39 24 C41 19 38 14 33 13 C34 8 30 4 24 4 Z M18 20 C20 22 23 22 25 20 M27 15 C29 17 31 17 33 15",
  },
  {
    key: "mushroom",
    tier: 1,
    ingredients: ["soil", "nature"],
    color: "#B81844",
    icon: "M6 24 C6 13 14 7 24 7 C34 7 42 13 42 24 Z M18 24 V36 C18 41 30 41 30 36 V24 M16 15 A2 2 0 1 1 16.01 15 M30 13 A3 3 0 1 1 30.01 13",
  },
  {
    key: "campfire",
    tier: 1,
    ingredients: ["fire", "nature"],
    color: "#C26C00",
    icon: "M24 31 C17 31 14 26 16 20 C18 15 22 13 22 5 C28 9 32 15 31 21 C34 19 34 16 33 14 C37 19 37 26 32 29 C30 31 27 31 24 31 Z",
    accents: [
      { d: CAMPFIRE_LOGS, color: "#4A2208", width: 8 },
      { d: CAMPFIRE_LOGS, color: "#A86A32", width: 4.5 },
      { d: "M14 37.3 L18 38.3 M30 37.7 L34 36.7", color: "#4A2208", width: 1.4 },
    ],
  },
  {
    key: "aurora",
    tier: 1,
    ingredients: ["wind", "light"],
    color: "#1F93AB",
    sheen: "linear-gradient(160deg, #B8FFE6 0%, #3FC9A6 30%, #4A6FD8 65%, #6A3FB0 100%)",
    icon: "M6 30 C12 18 18 18 24 26 C30 34 36 30 42 18 M6 39 C12 29 18 29 24 35 C30 41 36 39 42 29 M12 8 V18 M20 6 V14 M30 8 V16 M38 6 V12",
  },
  {
    key: "rainbow",
    tier: 1,
    ingredients: ["water", "light"],
    color: "#FF4477",
    sheen: "linear-gradient(180deg, #FF6B6B 0%, #FFB347 22%, #F7E05A 40%, #6BD47A 58%, #4FA3F0 78%, #8A5BE0 100%)",
    icon: "M6 36 A18 18 0 0 1 42 36 M12 36 A12 12 0 0 1 36 36 M18 36 A6 6 0 0 1 30 36",
  },
  {
    key: "crystal",
    tier: 1,
    ingredients: ["soil", "light"],
    color: "#BF4FF9",
    icon: "M24 4 L32 14 L30 41 H18 L16 14 Z M16 14 H32 M24 4 V41 M16 21 L8 27 L11 41 H18 M32 21 L40 27 L37 41 H30",
  },
  {
    key: "sun",
    tier: 1,
    ingredients: ["fire", "light"],
    color: "#FFA41B",
    icon: "M33 24 A9 9 0 1 1 15 24 A9 9 0 1 1 33 24 M24 4 V9 M24 39 V44 M4 24 H9 M39 24 H44 M10 10 L13.5 13.5 M38 10 L34.5 13.5 M10 38 L13.5 34.5 M38 38 L34.5 34.5 M20 22 V22.5 M28 22 V22.5 M20 27 C22 29.5 26 29.5 28 27",
  },
  {
    key: "flower",
    tier: 1,
    ingredients: ["nature", "light"],
    color: "#FF9CCF",
    icon: "M27 17 A3 3 0 1 1 21 17 A3 3 0 1 1 27 17 M24 14 C19 4 29 4 24 14 M27 17 C37 13 37 23 27 18 M21 17 C11 13 11 23 21 18 M22 20 C15 28 22 30 24 20 M26 20 C33 28 26 30 24 20 M24 28 V44 M24 38 C28 33 34 34 36 34",
  },
  { key: "ghost", tier: 1, ingredients: ["wind", "shadow"], color: "#CBC0FF", icon: "M12 42 V22 A12 12 0 0 1 36 22 V42 L32 38 L28 42 L24 38 L20 42 L16 38 Z M19 22 V25 M29 22 V25" },
  {
    key: "poison",
    tier: 1,
    ingredients: ["water", "shadow"],
    color: "#9E9D09",
    icon: "M19 6 H29 M21 6 V16 L11 36 C9 40 12 43 16 43 H32 C36 43 39 40 37 36 L27 16 V6 M15 30 H33 M21 36 A1.5 1.5 0 1 1 21.01 36 M28 34 A2 2 0 1 1 28.01 34",
  },
  { key: "cave", tier: 1, ingredients: ["soil", "shadow"], color: "#2C2731", icon: "M4 40 L14 16 L22 10 L32 12 L40 22 L44 40 Z M16 40 V31 A8 8 0 0 1 32 31 V40" },
  {
    key: "smoke",
    tier: 1,
    ingredients: ["fire", "shadow"],
    color: "#8F8E82",
    icon: "M14 40 C8 40 6 32 12 30 C10 24 18 20 22 24 C24 18 34 18 34 26 C40 26 42 34 36 36 C36 40 30 42 26 40 Z M30 14 C32 10 36 10 38 12 M18 12 C20 8 24 8 26 10",
  },
  { key: "thorn", tier: 1, ingredients: ["nature", "shadow"], color: "#5B0B28", icon: "M8 40 C18 32 30 30 40 8 M14 36 L10 30 M20 32 L22 25 M27 28 L24 22 M32 22 L38 22 M36 14 L32 12" },
  {
    key: "eclipse",
    tier: 1,
    ingredients: ["light", "shadow"],
    color: "#00003C",
    icon: "M34 24 A10 10 0 1 1 14 24 A10 10 0 1 1 34 24 M24 4 V8 M24 40 V44 M4 24 H8 M40 24 H44 M10 10 L13 13 M38 10 L35 13 M10 38 L13 35 M38 38 L35 35 M28 15 A10 10 0 0 0 28 33",
  },
  { key: "brick", tier: 2, ingredients: ["water", "soil", "fire"], color: "#7D230A", icon: "M6 14 H42 V34 H6 Z M6 24 H42 M18 14 V24 M30 14 V24 M12 24 V34 M24 24 V34 M36 24 V34" },
  { key: "glass", tier: 2, ingredients: ["wind", "soil", "fire"], color: "#ABFFE3", icon: "M12 6 H36 L32 41 H16 Z M14 18 H34 M18 10 L20 14" },
  {
    key: "storm",
    tier: 2,
    ingredients: ["wind", "water", "fire"],
    color: "#00487A",
    icon: "M14 28 C7 28 6 18 13 17 C14 9 25 8 28 14 C34 10 42 15 39 22 C43 24 41 28 37 28 Z M25 31 L20 38 H26 L23 45",
  },
  {
    key: "glacier",
    tier: 2,
    ingredients: ["wind", "water", "soil"],
    color: "#73B4FF",
    icon: "M8 30 L16 14 L22 20 L28 8 L40 30 Z M4 36 C10 33 14 39 20 36 C26 33 30 39 36 36 C40 34 42 35 44 36 M6 42 C12 39 16 45 22 42 C28 39 32 45 38 42",
  },
  { key: "sword", tier: 2, ingredients: ["soil", "fire", "nature"], color: "#848BA8", icon: "M36 6 H42 V12 L18 36 L12 30 Z M10 26 L22 38 M14 34 L7 41" },
  { key: "forest", tier: 2, ingredients: ["water", "soil", "nature"], color: "#0C371A", icon: "M14 43 V35 M34 43 V35 M14 6 L4 35 H24 Z M34 10 L24 35 H44 Z" },
  {
    key: "lantern",
    tier: 2,
    ingredients: ["fire", "nature", "light"],
    color: "#FF6E41",
    icon: "M18 10 H30 M20 10 V6 H28 V10 M14 14 H34 L32 38 H16 Z M12 42 H36 M24 32 C20 32 19 28 21 25 C22 23 24 22 24 19 C27 21 28 24 27 27 C28 29 27 32 24 32 Z",
  },
  {
    key: "prism",
    tier: 2,
    ingredients: ["soil", "light", "shadow"],
    color: "#FCDFE6",
    sheen: "linear-gradient(135deg, #FFFFFF 0%, #CDE6F5 35%, #E7D2FF 65%, #FFE0C2 100%)",
    icon: "M24 8 L40 36 H8 Z M2 26 L17 22 M31 22 L46 16 M31 24 L46 24 M31 26 L46 32",
  },
  {
    key: "nightmare",
    tier: 2,
    ingredients: ["wind", "light", "shadow"],
    color: "#A21680",
    icon: "M4 24 C12 12 36 12 44 24 C36 36 12 36 4 24 Z M30 24 A6 6 0 1 1 18 24 A6 6 0 1 1 30 24 M22 24 H26 M10 9 L14 13 M38 9 L34 13",
  },
  {
    key: "swamp",
    tier: 2,
    ingredients: ["water", "soil", "shadow"],
    color: "#5D7123",
    icon: "M4 34 C10 31 14 37 20 34 C26 31 30 37 36 34 C40 32 42 33 44 34 M8 40 H40 M14 32 V12 M14 12 C11 12 11 20 14 20 M28 32 V16 M28 16 C25 16 25 22 28 22 M36 32 L40 18",
  },
];

const compoundList: Compound[] = compoundSpecs.map(({ key, tier, ingredients, ...spec }) => ({ key, tier, ingredients, ...art(spec) }));

export const COMPOUNDS: Record<string, Compound> = Object.fromEntries(compoundList.map((compound) => [compound.key, compound]));

export const COMPOUND_ORDER: string[] = compoundList.map((compound) => compound.key);

const recipeKey = (ingredients: BaseKey[]) => [...ingredients].sort().join("+");

const compoundsByRecipe = new Map(compoundList.map((compound) => [recipeKey(compound.ingredients), compound]));

export function compoundFor(ingredients: BaseKey[]): Compound | undefined {
  return compoundsByRecipe.get(recipeKey(ingredients));
}

export function basesForSize(size: GridSize): BaseKey[] {
  return BASE_ORDER.slice(0, size);
}

export function baseAt(index: number): BaseElement {
  return BASE_ELEMENTS[BASE_ORDER[index]];
}

export function compoundMetal(compound: Compound): MedallionMetal {
  return compound.tier === 2 ? "gold" : "silver";
}

export function ingredientIndexes(compoundKey: string): number[] {
  return COMPOUNDS[compoundKey].ingredients.map((key) => BASE_ORDER.indexOf(key));
}

export function allArtColors(): Record<string, string> {
  return Object.fromEntries([
    ...BASE_ORDER.map((key) => [key, BASE_ELEMENTS[key].color]),
    ...compoundList.map((compound) => [compound.key, compound.color]),
  ]);
}
