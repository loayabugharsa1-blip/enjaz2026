function getSecret(): string {
  const secret = process.env?.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

function getKey(usage: KeyUsage, secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret.padEnd(32, "\0").slice(0, 32));
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

export async function signSession(payload: string): Promise<string> {
  const secret = getSecret();
  const key = await getKey("sign", secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${payload}.${sigHex}`;
}

export async function verifySession(signed: string): Promise<string | null> {
  try {
    const secret = getSecret();
    const dot = signed.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = signed.slice(0, dot);
    const sigHex = signed.slice(dot + 1);
    const key = await getKey("verify", secret);
    const enc = new TextEncoder();
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
    return valid ? payload : null;
  } catch {
    return null;
  }
}
