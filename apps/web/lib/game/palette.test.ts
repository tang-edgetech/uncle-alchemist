import { describe, expect, it } from "vitest";
import { allArtColors } from "./elements";

const MIN_DELTA_E = 15;

const toLinear = (unit: number) => (unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4);
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const degrees = (value: number) => ((value * 180) / Math.PI + 360) % 360;

function hexToLab(hex: string): [number, number, number] {
  const [red, green, blue] = [1, 3, 5].map((offset) => toLinear(parseInt(hex.slice(offset, offset + 2), 16) / 255));
  const x = (0.4124 * red + 0.3576 * green + 0.1805 * blue) / 0.95047;
  const y = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const z = (0.0193 * red + 0.1192 * green + 0.9505 * blue) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE2000([L1, a1, b1]: number[], [L2, a2, b2]: number[]): number {
  const chromaMean = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const g = 0.5 * (1 - Math.sqrt(chromaMean ** 7 / (chromaMean ** 7 + 25 ** 7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;
  const c1p = Math.hypot(a1p, b1);
  const c2p = Math.hypot(a2p, b2);
  const h1p = c1p === 0 ? 0 : degrees(Math.atan2(b1, a1p));
  const h2p = c2p === 0 ? 0 : degrees(Math.atan2(b2, a2p));
  let hueDiff = 0;
  if (c1p * c2p !== 0) {
    hueDiff = h2p - h1p;
    if (hueDiff > 180) hueDiff -= 360;
    else if (hueDiff < -180) hueDiff += 360;
  }
  const deltaH = 2 * Math.sqrt(c1p * c2p) * Math.sin(radians(hueDiff / 2));
  const lightMean = (L1 + L2) / 2;
  const chromaPMean = (c1p + c2p) / 2;
  let hueMean = h1p + h2p;
  if (c1p * c2p !== 0) {
    hueMean = Math.abs(h1p - h2p) > 180 ? (h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2) : (h1p + h2p) / 2;
  }
  const t =
    1 -
    0.17 * Math.cos(radians(hueMean - 30)) +
    0.24 * Math.cos(radians(2 * hueMean)) +
    0.32 * Math.cos(radians(3 * hueMean + 6)) -
    0.2 * Math.cos(radians(4 * hueMean - 63));
  const rotation = 30 * Math.exp(-(((hueMean - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(chromaPMean ** 7 / (chromaPMean ** 7 + 25 ** 7));
  const sl = 1 + (0.015 * (lightMean - 50) ** 2) / Math.sqrt(20 + (lightMean - 50) ** 2);
  const sc = 1 + 0.045 * chromaPMean;
  const sh = 1 + 0.015 * chromaPMean * t;
  const rt = -Math.sin(radians(2 * rotation)) * rc;
  const dl = (L2 - L1) / sl;
  const dc = (c2p - c1p) / sc;
  const dh = deltaH / sh;
  return Math.sqrt(dl ** 2 + dc ** 2 + dh ** 2 + rt * dc * dh);
}

describe("element palette", () => {
  it(`keeps every pair of element colours at least ΔE2000 ${MIN_DELTA_E} apart`, () => {
    const entries = Object.entries(allArtColors()).map(([name, hex]) => ({ name, lab: hexToLab(hex) }));
    const tooClose: string[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const distance = deltaE2000(entries[i].lab, entries[j].lab);
        if (distance < MIN_DELTA_E) tooClose.push(`${entries[i].name} ~ ${entries[j].name} (${distance.toFixed(1)})`);
      }
    }
    expect(entries).toHaveLength(38);
    expect(tooClose).toEqual([]);
  });
});
