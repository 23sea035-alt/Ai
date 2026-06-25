import { describe, it, expect } from "vitest";
import { extractKeywords, jaccardSimilarity } from "../services/memory/keywords.js";

describe("extractKeywords", () => {
  it("extracts significant words from a sentence", () => {
    const result = extractKeywords("I love programming in TypeScript");
    expect(result).toContain("love");
    expect(result).toContain("programming");
    expect(result).toContain("typescript");
  });

  it("filters out stop words", () => {
    const result = extractKeywords("the cat and the dog are running");
    expect(result).not.toContain("the");
    expect(result).not.toContain("and");
    expect(result).not.toContain("are");
    expect(result).toContain("cat");
    expect(result).toContain("dog");
    expect(result).toContain("running");
  });

  it("filters words 2 characters or shorter", () => {
    const result = extractKeywords("a is ok be it");
    expect(result).toEqual([]);
  });

  it("handles punctuation", () => {
    const result = extractKeywords("Hello! How's it going?");
    expect(result).toContain("hello");
    expect(result).toContain("how's");
    expect(result).toContain("going");
  });

  it("returns empty array for empty input", () => {
    const result = extractKeywords("");
    expect(result).toEqual([]);
  });

  it("deduplicates repeated tokens", () => {
    const result = extractKeywords("cat cat dog dog");
    expect(result.filter((w) => w === "cat").length).toBe(1);
    expect(result.filter((w) => w === "dog").length).toBe(1);
  });
});

describe("jaccardSimilarity", () => {
  it("returns 1 for identical sets", () => {
    const a = new Set(["cat", "dog"]);
    const b = new Set(["cat", "dog"]);
    expect(jaccardSimilarity(a, b)).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    const a = new Set(["cat"]);
    const b = new Set(["dog"]);
    expect(jaccardSimilarity(a, b)).toBe(0);
  });

  it("returns correct value for partial overlap", () => {
    const a = new Set(["cat", "dog", "bird"]);
    const b = new Set(["cat", "fish", "bird"]);
    expect(jaccardSimilarity(a, b)).toBe(0.5);
  });

  it("returns 0 when both sets are empty", () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });

  it("returns 0 when one set is empty", () => {
    expect(jaccardSimilarity(new Set(["cat"]), new Set())).toBe(0);
  });
});
