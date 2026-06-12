const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, max: number = 20, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;

  if (hits.size > 10000) {
    const cutoff = now - 120000;
    for (const [key, val] of hits) {
      if (val.resetAt < cutoff) hits.delete(key);
    }
  }

  return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count) };
}
