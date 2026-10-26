import { describe, expect, it } from "vitest";
import en from "./en.json";
import zh from "./zh.json";

describe("translations", () => {
  it("has the same keys in English and Chinese", () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });

  it("uses the same placeholders in both languages", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    const mismatched = Object.entries(en).filter(([key, text]) => placeholders(text).join() !== placeholders(zh[key as keyof typeof zh]).join());
    expect(mismatched.map(([key]) => key)).toEqual([]);
  });
});
