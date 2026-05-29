function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Serializes API-Football calls so free-tier plans (e.g. 10 req/min) are not bursted.
 */
export class ApiRateLimiter {
  private lastRequestAt = 0;
  readonly minIntervalMs: number;
  readonly requestsPerMinute: number;

  constructor(options?: { requestsPerMinute?: number; minIntervalMs?: number }) {
    const rpm = options?.requestsPerMinute ?? readRequestsPerMinute();
    this.requestsPerMinute = rpm;
    const fromEnv = readMinIntervalMs();
    this.minIntervalMs =
      options?.minIntervalMs ??
      fromEnv ??
      Math.ceil(60_000 / rpm) + 500;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const waitMs = this.minIntervalMs - (now - this.lastRequestAt);
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    this.lastRequestAt = Date.now();
  }
}

function readRequestsPerMinute(): number {
  const raw = process.env.API_FOOTBALL_REQUESTS_PER_MINUTE;
  const n = raw ? Number(raw) : 10;
  return Number.isFinite(n) && n > 0 ? n : 10;
}

function readMinIntervalMs(): number | undefined {
  const raw = process.env.API_FOOTBALL_MIN_INTERVAL_MS;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function rateLimitRetryDelayMs(): number {
  const raw = process.env.API_FOOTBALL_RATE_LIMIT_RETRY_MS;
  const n = raw ? Number(raw) : 65_000;
  return Number.isFinite(n) && n > 0 ? n : 65_000;
}
