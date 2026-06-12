import { describe, it, expect } from "vitest";
import { CONFIG } from "../lib/config";

describe("config", () => {
  it("has company phone", () => {
    expect(CONFIG.company.phone).toBeTruthy();
  });

  it("has site names", () => {
    expect(CONFIG.site.nameAr).toBeTruthy();
    expect(CONFIG.site.nameEn).toBeTruthy();
  });
});
