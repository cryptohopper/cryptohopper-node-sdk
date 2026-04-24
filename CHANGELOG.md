# Changelog

All notable changes to `@cryptohopper/sdk` are documented in this file.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.1.0-alpha.1 — Unreleased

Initial release. Covers six core API domains.

### Transport
- `CryptohopperClient` — OAuth2 bearer auth, optional `appKey` sent as `x-api-app-key`.
- `CryptohopperError` — typed error with `code`, `status`, `serverCode`, `ipAddress`, `retryAfterMs`.
- Automatic retry on HTTP 429 honouring `Retry-After` (default `maxRetries: 3`, configurable/disableable).
- Configurable `timeoutMs`, injectable `fetch`, optional `userAgent` suffix.

### Resources
- `user` — `get`
- `hoppers` — `list`, `get`, `create`, `update`, `delete`, `positions`, `position`, `orders`, `buy`, `sell`, `configGet`, `configUpdate`, `configPools`, `panic`
- `exchange` — `ticker`, `candles`, `orderbook`, `markets`, `currencies`, `exchanges`, `forexRates`
- `strategy` — `list`, `get`, `create`, `update`, `delete`
- `backtest` — `create`, `get`, `list`, `cancel`, `restart`, `limits`
- `market` — `signals`, `signal`, `items`, `item`, `homepage`

### Out of scope (post-alpha)
- Domains: `signals`, `arbitrage`, `tournaments`, `marketmaker`, `social`, `ai`, `template`, `subscription`, `platform`, `api`, `app`, `device`, `chart`
- HMAC request signing (`x-api-signature`)
- Mobile device-id flow
