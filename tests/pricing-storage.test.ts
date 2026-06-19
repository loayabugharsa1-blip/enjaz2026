import { describe, it, expect, beforeAll } from "vitest";

// Mock browser globals for write tests (pricing-storage checks typeof window)
beforeAll(() => {
  if (typeof globalThis.window === "undefined") {
    const store: Record<string, string> = {};
    // @ts-expect-error - mock window + localStorage for tests
    globalThis.window = {};
    // @ts-expect-error - mock localStorage for tests
    globalThis.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      length: 0,
      key: () => null,
    };
  }
});

import { getPricingRules, updatePricingRule, resetPricingRules } from "../lib/pricing-storage";

describe("pricing-storage", () => {
  it("getPricingRules returns default rules", () => {
    const rules = getPricingRules();
    expect(rules.length).toBe(33);
    expect(rules[0]).toHaveProperty("serviceId");
    expect(rules[0]).toHaveProperty("pricePerUnit");
  });

  it("updatePricingRule returns updated rule", () => {
    const rules = getPricingRules();
    const first = rules[0];
    const updated = updatePricingRule(first.id, 999);
    expect(updated).not.toBeNull();
    expect(updated!.pricePerUnit).toBe(999);
    expect(updated!.id).toBe(first.id);
    resetPricingRules();
  });

  it("updatePricingRule returns null for unknown id", () => {
    const result = updatePricingRule("nonexistent-id", 100);
    expect(result).toBeNull();
  });

  it("rules contain serviceId matching new BUG#4 IDs", () => {
    const rules = getPricingRules();
    const ids = rules.map((r) => r.serviceId);
    expect(ids).toContain("gift-sugar-sheet");
    expect(ids).toContain("gift-choco-transfer");
    expect(ids).toContain("gift-wafer-paper");
    expect(ids).toContain("papers-copiest");
  });

  it("resetPricingRules restores defaults", () => {
    const first = getPricingRules()[0];
    updatePricingRule(first.id, 1);
    resetPricingRules();
    const restored = getPricingRules();
    const found = restored.find((r) => r.id === first.id);
    expect(found).toBeDefined();
    expect(found!.pricePerUnit).not.toBe(1);
  });

  it("every rule has unique id", () => {
    const rules = getPricingRules();
    const ids = rules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
