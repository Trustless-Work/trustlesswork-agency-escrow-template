/**
 * Bounded retry + polling helpers for the testnet runtime.
 *
 * - `withRateLimitRetry` retries transient failures (429 / 5xx) with capped
 *   exponential backoff. It never retries logic errors (400/401/wrong wallet).
 * - `pollUntil` re-reads a value until a predicate holds or a bounded timeout is
 *   reached, so we confirm indexer state instead of assuming optimistic success.
 */

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

function isRetryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b/.test(message) || /rate limit|timeout|network/i.test(message);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 8000;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      await sleep(delay);
    }
  }
  throw lastError;
}

export type PollOptions = {
  attempts?: number;
  intervalMs?: number;
};

/**
 * Poll `read` until `predicate` returns true or the attempt budget is exhausted.
 * Returns the last-read value when satisfied; returns `null` on timeout so the
 * caller can decide whether to raise an IndexerTimeoutError.
 */
export async function pollUntil<T>(
  read: () => Promise<T>,
  predicate: (value: T) => boolean,
  options: PollOptions = {},
): Promise<{ value: T; confirmed: boolean }> {
  const attempts = options.attempts ?? 8;
  const intervalMs = options.intervalMs ?? 2000;

  let value = await read();
  if (predicate(value)) return { value, confirmed: true };

  for (let attempt = 1; attempt < attempts; attempt++) {
    await sleep(intervalMs);
    value = await read();
    if (predicate(value)) return { value, confirmed: true };
  }

  return { value, confirmed: false };
}
