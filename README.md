# @cryptohopper/sdk

[![npm](https://img.shields.io/npm/v/@cryptohopper/sdk?include_prereleases&logo=npm)](https://www.npmjs.com/package/@cryptohopper/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@cryptohopper/sdk?logo=npm&label=downloads)](https://www.npmjs.com/package/@cryptohopper/sdk)
[![Node](https://img.shields.io/node/v/@cryptohopper/sdk?logo=nodedotjs)](./package.json)
[![CI](https://github.com/cryptohopper/cryptohopper-node-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptohopper/cryptohopper-node-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/cryptohopper/cryptohopper-node-sdk?color=blue)](LICENSE)

Official Node.js SDK for the [Cryptohopper](https://www.cryptohopper.com) API.

> **Status: 0.4.0-alpha.1** — full coverage of all 18 public API domains: `user`, `hoppers`, `exchange`, `strategy`, `backtest`, `market`, `signals`, `arbitrage`, `marketmaker`, `template`, `ai`, `platform`, `chart`, `subscription`, `social`, `tournaments`, `webhooks`, `app`.

**Deeper docs:** [Getting Started](docs/Getting-Started.md) · [Authentication](docs/Authentication.md) · [Error Handling](docs/Error-Handling.md) · [Rate Limits](docs/Rate-Limits.md)

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

For runnable scripts you can clone and tinker with, see [`examples/`](examples/) — covers public ticker, whoami, hopper listing, error handling, and a 30-day backtest.

## Resources

```ts
// User
await ch.user.get();

// Hoppers (trading bots)
await ch.hoppers.list({ exchange: "binance" });
await ch.hoppers.get(42);
await ch.hoppers.create({ name: "My Bot", exchange: "binance" });
await ch.hoppers.update(42, { name: "Renamed" });
await ch.hoppers.delete(42);
await ch.hoppers.positions(42);
await ch.hoppers.orders(42);
await ch.hoppers.buy({ hopper_id: 42, market: "BTC/USDT", amount: 0.001 });
await ch.hoppers.sell({ hopper_id: 42, market: "BTC/USDT", amount: 0.001 });
await ch.hoppers.configGet(42);
await ch.hoppers.configUpdate(42, { /* config fields */ });
await ch.hoppers.panic(42);

// Exchange — market data (still requires a real token; the gateway has no anonymous routes)
await ch.exchange.ticker({ exchange: "binance", market: "BTC/USDT" });
await ch.exchange.candles({ exchange: "binance", market: "BTC/USDT", timeframe: "1h" });
await ch.exchange.orderbook({ exchange: "binance", market: "BTC/USDT" });
await ch.exchange.markets("binance");
await ch.exchange.exchanges();

// Strategy
await ch.strategy.list();
await ch.strategy.get(5);
await ch.strategy.create({ name: "My Strategy", ... });
await ch.strategy.update(5, { name: "Renamed" });
await ch.strategy.delete(5);

// Backtest
await ch.backtest.create({ hopper_id: 42, from_date: "2026-01-01", to_date: "2026-03-01" });
await ch.backtest.get(1);
await ch.backtest.list();
await ch.backtest.cancel(1);
await ch.backtest.limits();

// Marketplace — same auth requirement as everything else
await ch.market.signals({ type: "buy" });
await ch.market.signal(99);
await ch.market.items({ type: "strategy" });
await ch.market.homepage();
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
