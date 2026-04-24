# @cryptohopper/sdk

Official Node.js SDK for the [Cryptohopper](https://www.cryptohopper.com) API.

> **Status: 0.1.0-alpha.1** — early scaffolding. Only `user.get()` is wired up. `hoppers`, `exchange`, `strategy`, `backtest`, and `market` resources land in subsequent alphas.

## Install

```bash
npm install @cryptohopper/sdk
```

Requires Node.js 20+.

## Quickstart

```ts
import { CryptohopperClient } from "@cryptohopper/sdk";

const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
});

const me = await ch.user.get();
console.log(me.email);
```

## Authentication

Cryptohopper uses OAuth2 bearer tokens. To get one:

1. Sign in at [cryptohopper.com](https://www.cryptohopper.com) and open the developer dashboard.
2. Create an OAuth application — you'll receive a `client_id` and `client_secret`.
3. Drive the OAuth consent flow (`/oauth-consent?app_id=<client_id>&redirect_uri=<your_uri>&state=<csrf>`) to receive a 40-character bearer token scoped to the permissions you requested.

Pass the token as `apiKey`. Optionally pass your OAuth `client_id` as `appKey` — it's sent as the `x-api-app-key` header.

```ts
const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
  appKey: process.env.CRYPTOHOPPER_CLIENT_ID, // optional
});
```

See [api.cryptohopper.com/v1/docs](https://api.cryptohopper.com/v1/docs) for the full API reference.

## Client options

| Option | Default | Description |
|---|---|---|
| `apiKey` | — (required) | OAuth2 bearer token |
| `appKey` | — | Optional OAuth `client_id`, sent as `x-api-app-key` |
| `baseUrl` | `https://api.cryptohopper.com/v1` | Override for staging/dev environments |
| `timeoutMs` | `30000` | Per-request timeout |
| `maxRetries` | `3` | Retries on HTTP 429 (respects `Retry-After`). Set to `0` to disable. |
| `fetch` | `globalThis.fetch` | Inject a fetch implementation |
| `userAgent` | — | Appended after `cryptohopper-sdk/<version>` |

## Errors

Every non-2xx response becomes a `CryptohopperError`:

```ts
import { CryptohopperClient, CryptohopperError } from "@cryptohopper/sdk";

try {
  await ch.user.get();
} catch (err) {
  if (err instanceof CryptohopperError) {
    console.log(err.code);         // "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | ...
    console.log(err.status);       // HTTP status
    console.log(err.serverCode);   // numeric unique error code from the server, if any
    console.log(err.ipAddress);    // client IP the server saw, useful for IP whitelist debugging
    console.log(err.retryAfterMs); // ms to wait on 429
  }
}
```

### Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token missing or invalid |
| `FORBIDDEN` | 403 | Missing permission scope or IP whitelist mismatch |
| `NOT_FOUND` | 404 | Resource or endpoint not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded (the SDK retries automatically by default) |
| `VALIDATION_ERROR` | 400 / 422 | Invalid parameters |
| `DEVICE_UNAUTHORIZED` | 402 | Mobile device not authorized (internal flow) |
| `SERVER_ERROR` | 5xx | Upstream error |
| `NETWORK_ERROR` | — | Transport failure |
| `TIMEOUT` | — | Request exceeded `timeoutMs` |

Unknown server-side codes pass through as-is on `.code`.

## Rate limiting

The server enforces three buckets:

- `normal` — 30 requests/minute
- `order` — 8 orders per 8-second window (`buy`, `sell`, `order`, `trade`)
- `backtest` — 1 request per 2 seconds

On HTTP 429 the SDK retries with exponential backoff up to `maxRetries` (default 3), respecting `Retry-After`. Set `maxRetries: 0` to disable and handle 429s yourself.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Release

Push a `sdk-v<version>` git tag. The release workflow typechecks, tests, builds, verifies tag-version parity, then publishes to npm with provenance.

## License

MIT — see [LICENSE](./LICENSE).
