const FALLBACK_SECRET = process.env.NEXT_PUBLIC_FALLBACK_SECRET || "injaz-fb-seed-v1-2026";

function getKey(usage: KeyUsage): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(FALLBACK_SECRET.padEnd(32, "\0").slice(0, 32));
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

export async function signFallback(payload: string): Promise<string> {
  const key = await getKey("sign");
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${payload}.${sigHex}`;
}

export async function verifyFallback(signed: string): Promise<string | null> {
  try {
    const dot = signed.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = signed.slice(0, dot);
    const sigHex = signed.slice(dot + 1);
    const key = await getKey("verify");
    const enc = new TextEncoder();
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
    return valid ? payload : null;
  } catch {
    return null;
  }
}
