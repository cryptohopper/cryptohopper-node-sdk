# Changelog

All notable changes to `@cryptohopper/sdk` are documented in this file.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.1.0-alpha.1 — Unreleased

Initial scaffolding.

- `CryptohopperClient` — transport, OAuth2 bearer auth, optional `x-api-app-key`, configurable timeout and retry budget.
- `CryptohopperError` — typed error class with `code`, `status`, `serverCode`, `ipAddress`, `retryAfterMs`.
- Automatic retry on HTTP 429 honouring `Retry-After` (default `maxRetries: 3`, configurable/disableable).
- `user.get()` — fetches the authenticated user's profile (`GET /user/get`).

Resources `hoppers`, `exchange`, `strategy`, `backtest`, `market` land in subsequent alphas.
