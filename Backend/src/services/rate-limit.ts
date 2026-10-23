interface RateLimitBucket {
  windowStartedAt: number;
  count: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Per-process limiter for protecting the anonymous API from accidental bursts. */
export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  consume(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitDecision {
    if (!key || !Number.isInteger(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
      throw new RangeError("Paramètres de limitation de requêtes invalides.");
    }

    let bucket = this.buckets.get(key);
    if (!bucket || now - bucket.windowStartedAt >= windowMs || now < bucket.windowStartedAt) {
      bucket = { windowStartedAt: now, count: 0 };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.windowStartedAt + windowMs - now) / 1000)),
      };
    }

    bucket.count += 1;
    if (this.buckets.size > 5000) {
      for (const [bucketKey, value] of this.buckets) {
        if (now - value.windowStartedAt >= windowMs || now < value.windowStartedAt) {
          this.buckets.delete(bucketKey);
        }
      }
    }

    return { allowed: true, remaining: Math.max(0, limit - bucket.count), retryAfterSeconds: 0 };
  }
}
