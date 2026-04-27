# Examples

Runnable scripts that exercise the most common usage patterns of `@cryptohopper/sdk`. Each file is self-contained and reads its bearer token from `CRYPTOHOPPER_TOKEN`. The API gateway requires authentication on every endpoint, including market-data routes, so all examples need a real token.

## Setup

From this directory:

```bash
npm install                        # installs the SDK + tsx
export CRYPTOHOPPER_TOKEN=...      # 40-char OAuth bearer
```

(On Windows PowerShell: `$env:CRYPTOHOPPER_TOKEN = "..."`.)

## Run an example

```bash
npx tsx ticker.ts                           # current BTC/USDT spot price on Binance
npx tsx whoami.ts                           # prints the authenticated user
npx tsx list-hoppers.ts                     # list every hopper on your account
npx tsx error-handling.ts <bad-hopper-id>   # demonstrates the typed error surface
npx tsx start-backtest.ts <hopper-id>       # kick off a 30-day backtest
```

## What each example shows

| File | Demonstrates |
|------|--------------|
| [`ticker.ts`](ticker.ts) | Single ticker fetch (current spot price) |
| [`whoami.ts`](whoami.ts) | Minimal authenticated request |
| [`list-hoppers.ts`](list-hoppers.ts) | Listing resource with optional filter, paginated table output |
| [`error-handling.ts`](error-handling.ts) | `CryptohopperError` codes, status, retry-after parsing |
| [`start-backtest.ts`](start-backtest.ts) | Long-running async resource — submit, poll, render result |

## Package layout

`package.json` here pins `@cryptohopper/sdk` to the workspace version and depends only on `tsx` for running TypeScript directly. Production users do **not** need `tsx` — these examples use it so the snippets stay readable. Compile and run with `tsc + node` in your own projects, or use TypeScript-aware bundlers / runtimes (Bun, Deno, ts-node).
