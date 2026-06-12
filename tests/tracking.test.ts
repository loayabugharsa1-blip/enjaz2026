import { describe, it, expect } from "vitest";
import { generateTrackingCode } from "../lib/tracking";

describe("tracking code", () => {
  it("generates ENJ-XXXXX format", () => {
    const id = crypto.randomUUID();
    const code = generateTrackingCode(id);
    expect(code).toMatch(/^ENJ-[A-Z0-9]{5}$/);
  });

  it("is deterministic for same id", () => {
    const id = crypto.randomUUID();
    const a = generateTrackingCode(id);
    const b = generateTrackingCode(id);
    expect(a).toBe(b);
  });

  it("produces unique codes for different ids", () => {
    const a = generateTrackingCode(crypto.randomUUID());
    const b = generateTrackingCode(crypto.randomUUID());
    expect(a).not.toBe(b);
  });
});
