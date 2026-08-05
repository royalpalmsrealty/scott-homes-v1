// In-memory, per-instance rate limiter. Fine for a single Vercel function
// instance; resets on redeploy/cold start. Move to Upstash/Vercel KV before
// scaling to multiple instances (see build brief §12, "Security and reliability").
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true as const };
  }

  if (bucket.count >= limit) {
    return { allowed: false as const, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true as const };
}
