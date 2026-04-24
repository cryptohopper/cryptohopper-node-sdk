# Rate Limits

Cryptohopper applies per-bucket rate limits on the server. When you hit one, you get a `429` response with a `Retry-After` header. The SDK handles this for you.

## The default behaviour

On every `429`, the SDK:

1. Parses `Retry-After` (either seconds or HTTP-date form).
2. Sleeps that long (falling back to exponential back-off if the header is missing).
3. Retries the request.
4. Repeats up to `maxRetries` (default 3).

If all retries exhaust, you get a `CryptohopperError` with `code: "RATE_LIMITED"` and `retryAfterMs` set to the last seen retry hint.

## Configuring it

```ts
const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
  maxRetries: 10,    // default 3
});
```

To **disable** retries entirely (e.g. you want to do your own back-off):

```ts
const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
  maxRetries: 0,
});
```

With `maxRetries: 0` a `429` surfaces immediately as `RATE_LIMITED`. Your code can then inspect `retryAfterMs` and schedule the retry on its own timeline.

## Buckets

Cryptohopper has three named buckets:

| Bucket | Scope | Example endpoints |
|---|---|---|
| `normal` | Most reads + writes | `/user/get`, `/hopper/list`, `/hopper/update`, `/exchange/ticker` |
| `order` | Anything that places or modifies orders | `/hopper/buy`, `/hopper/sell`, `/hopper/panic` |
| `backtest` | The (expensive) backtest subsystem | `/backtest/new`, `/backtest/get` |

The SDK doesn't know which bucket a call is against — it only sees the 429. You don't need to either; the server will tell you when you're limited.

## Hitting limits intentionally (backfill jobs)

If you're ingesting historical data and need to fetch many pages:

```ts
import { CryptohopperError } from "@cryptohopper/sdk";

const ch = new CryptohopperClient({
  apiKey: token,
  maxRetries: 0, // we'll pace it ourselves
});

for (const hopperId of allHopperIds) {
  while (true) {
    try {
      const orders = await ch.hoppers.orders(hopperId);
      await processOrders(orders);
      break;
    } catch (err) {
      if (err instanceof CryptohopperError && err.code === "RATE_LIMITED") {
        await new Promise((r) => setTimeout(r, err.retryAfterMs ?? 1_000));
        continue;
      }
      throw err;
    }
  }
}
```

This pattern lets a single long-running job honour rate limits without stalling other work, because you decide how aggressive the retry is.

## What the SDK does NOT do

- **No global semaphore.** If you spawn 100 concurrent calls and the server rate-limits them, each call's retry is independent; you might get 100 simultaneous sleeps. For high-concurrency workloads, cap concurrency yourself (e.g. [`p-limit`](https://www.npmjs.com/package/p-limit)).
- **No adaptive slow-down.** After a `429`, the SDK waits and retries that one call — it doesn't throttle future calls. If you see frequent 429s, add concurrency caps or back-off yourself.
- **No token-bucket tracking client-side.** The server is the source of truth. We don't try to predict limits.

## Diagnosing "always rate-limited"

If every request returns `RATE_LIMITED` even at low volume:

1. Check that your app hasn't been flagged for abuse in the Cryptohopper dashboard.
2. Check that you haven't accidentally created a loop that retries on non-429 errors too.
3. Check the `serverCode` field on the error — Cryptohopper sometimes includes a numeric detail there that clarifies what bucket you've tripped.
