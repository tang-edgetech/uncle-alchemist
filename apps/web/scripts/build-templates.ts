import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generatePuzzle } from "../lib/game/generator";
import { encodeDigits, type BoardTemplate } from "../lib/game/templates";
import { EMPTY, type GridSize } from "../lib/game/types";

const TEMPLATES_PER_SIZE = 6;

const TEMPLATE_MIN_GIVENS: Record<GridSize, number> = { 4: 6, 5: 7, 6: 11, 7: 17 };

const SEED_BASE: Record<GridSize, number> = { 4: 4000, 5: 5000, 6: 6000, 7: 7000 };

const sizes: GridSize[] = [4, 5, 6, 7];

const templates: BoardTemplate[] = sizes.flatMap((size) =>
  Array.from({ length: TEMPLATES_PER_SIZE }, (_, index) => {
    const puzzle = generatePuzzle(size, SEED_BASE[size] + index, TEMPLATE_MIN_GIVENS[size]);
    return {
      id: `${size}-${String(index + 1).padStart(2, "0")}`,
      size,
      regions: encodeDigits(puzzle.regions),
      solution: encodeDigits(puzzle.solution),
      givens: puzzle.givens.map((value) => (value === EMPTY ? "0" : "1")).join(""),
      cages: puzzle.cages.map((cage) => cage.cells),
    };
  }),
);

const target = fileURLToPath(new URL("../lib/game/templates.json", import.meta.url));
writeFileSync(target, `${JSON.stringify(templates, null, 2)}\n`);
console.log(`Wrote ${templates.length} templates to ${target}`);
