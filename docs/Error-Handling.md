# Error Handling

Every non-2xx response and every transport failure raises a `CryptohopperError`. Same shape across every SDK in every language.

```ts
import { CryptohopperError } from "@cryptohopper/sdk";

try {
  await ch.hoppers.get(999999);
} catch (err) {
  if (err instanceof CryptohopperError) {
    console.error({
      code: err.code,           // "NOT_FOUND"
      status: err.status,       // 404
      message: err.message,     // "Hopper not found"
      serverCode: err.serverCode, // Cryptohopper numeric code, e.g. 4100
      ipAddress: err.ipAddress,   // server-reported caller IP
      retryAfterMs: err.retryAfterMs, // only set for 429
    });
  }
}
```

## Error code catalog

| `code` | HTTP | When you'll see it | Recover by |
|---|---|---|---|
| `VALIDATION_ERROR` | 400, 422 | Missing or malformed parameter | Fix the request; the message says which param |
| `UNAUTHORIZED` | 401 | Token missing, wrong, or revoked | Re-auth; your refresh flow kicks in |
| `DEVICE_UNAUTHORIZED` | 402 | Internal Cryptohopper device-auth flow rejected you | You shouldn't see this via the public API; contact support if you do |
| `FORBIDDEN` | 403 | Scope missing, or IP not allowlisted | Check `err.ipAddress`; add to allowlist or grant the scope on the app |
| `NOT_FOUND` | 404 | Resource or endpoint doesn't exist | Check the ID; check you're using the latest SDK |
| `CONFLICT` | 409 | Resource is in a conflicting state (e.g. starting a new backtest while one is queued) | Cancel the existing job or wait |
| `RATE_LIMITED` | 429 | Bucket exhausted | The SDK auto-retries; see [Rate Limits](Rate-Limits) |
| `SERVER_ERROR` | 500–502, 504 | Cryptohopper's end | Retry with back-off; report if persistent |
| `SERVICE_UNAVAILABLE` | 503 | Planned maintenance or downstream outage | Respect `Retry-After`; retry |
| `NETWORK_ERROR` | — | DNS failure, TCP reset, TLS handshake failure | Retry; check your network |
| `TIMEOUT` | — | Hit the client-side `timeoutMs` | Retry; bump `timeoutMs` if the operation is legitimately slow |
| `UNKNOWN` | any | Anything else the SDK didn't recognise | Check `err.status` and `err.message` |

These strings are stable across SDK versions — don't parse them at runtime, compare with `===`.

## The retry surface

- **429 retries are automatic** up to `maxRetries` (default 3). The SDK parses `Retry-After` and honours it. See [Rate Limits](Rate-Limits) for the exact algorithm.
- **Everything else you handle yourself.** `SERVER_ERROR` and `NETWORK_ERROR` are often transient and benefit from retry; `UNAUTHORIZED` / `VALIDATION_ERROR` / `NOT_FOUND` never do.

## Writing robust retry logic

A pragmatic pattern:

```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; baseMs?: number } = {},
): Promise<T> {
  const { maxAttempts = 5, baseMs = 500 } = opts;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!(err instanceof CryptohopperError)) throw err;
      const transient = ["SERVER_ERROR", "SERVICE_UNAVAILABLE", "NETWORK_ERROR", "TIMEOUT"].includes(err.code);
      if (!transient || attempt === maxAttempts) throw err;
      const wait = err.retryAfterMs ?? baseMs * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error("unreachable");
}
```

Don't include `RATE_LIMITED` in the list — the SDK already retries it internally.

## JSON-friendly error serialization

When you're piping SDK errors through a logger that wants plain objects:

```ts
function errToObject(err: unknown) {
  if (err instanceof CryptohopperError) {
    return {
      kind: "cryptohopper",
      code: err.code,
      status: err.status,
      message: err.message,
      server_code: err.serverCode,
      ip_address: err.ipAddress,
      retry_after_ms: err.retryAfterMs,
    };
  }
  return {
    kind: "unknown",
    message: err instanceof Error ? err.message : String(err),
  };
}
```
