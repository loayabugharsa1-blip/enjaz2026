import { describe, it, expect } from "vitest";
import { rateLimit } from "../lib/rate-limit";

describe("rateLimit", () => {
  it("allows first request", () => {
    const result = rateLimit("test-ip-1", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks when over limit", () => {
    const ip = "test-ip-2";
    for (let i = 0; i < 5; i++) {
      const r = rateLimit(ip, 5, 60000);
      expect(r.allowed).toBe(true);
    }
    const blocked = rateLimit(ip, 5, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const ip = "test-ip-3";
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, 5, 10);
    }
    const blocked = rateLimit(ip, 5, 10);
    expect(blocked.allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const afterReset = rateLimit(ip, 5, 10);
        expect(afterReset.allowed).toBe(true);
        resolve();
      }, 15);
    });
  });
});
