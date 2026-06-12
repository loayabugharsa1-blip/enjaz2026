if (!process.env?.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}
const SECRET = process.env.SESSION_SECRET;

export async function signSession(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET.padEnd(32, "\0").slice(0, 32));
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${payload}.${sigHex}`;
}

export async function verifySession(signed: string): Promise<string | null> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = signed.slice(0, dot);
  const sigHex = signed.slice(dot + 1);
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET.padEnd(32, "\0").slice(0, 32));
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
    return valid ? payload : null;
  } catch {
    return null;
  }
}
