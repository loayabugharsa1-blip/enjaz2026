import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "../lib/auth/session";

describe("session signing", () => {
  it("signs and verifies payload", async () => {
    const payload = JSON.stringify({ userId: "abc", role: "admin" });
    const signed = await signSession(payload);
    expect(signed).toContain(payload);
    const verified = await verifySession(signed);
    expect(verified).toBe(payload);
  });

  it("rejects tampered signature", async () => {
    const payload = JSON.stringify({ userId: "abc", role: "staff" });
    const signed = await signSession(payload);
    const tampered = signed.replace("staff", "admin");
    const verified = await verifySession(tampered);
    expect(verified).toBeNull();
  });

  it("rejects malformed cookie", async () => {
    expect(await verifySession("no-dot-here")).toBeNull();
    expect(await verifySession("")).toBeNull();
  });
});
