# Getting Started

## Install

```bash
npm install @cryptohopper/sdk
```

Requires Node.js 20 or newer. The SDK is ESM-only — if you're on CommonJS you'll need to use `await import()` or migrate.

## First call

```ts
import { CryptohopperClient } from "@cryptohopper/sdk";

const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
});

const me = await ch.user.get();
console.log("Logged in as:", me.email);
```

## Getting a token

Every request (except a handful of public endpoints like `/exchange/ticker`) needs an OAuth2 bearer token. Create one via **Developer → Create App** on [cryptohopper.com](https://www.cryptohopper.com) and run through the consent flow. The token is a 40-character opaque string.

For production scripts, store the token in your secret manager of choice. For local development, the simplest path is:

```bash
export CRYPTOHOPPER_TOKEN=<your-token>
```

## Common pitfalls

**"Your environment does not support ESM."** — you're on Node 18 or older, or you have `"type": "commonjs"` in package.json. The SDK ships ESM-only by design. Upgrade Node or use a dynamic `await import()`.

**Unhandled promise rejections.** — every SDK method is `async`. You have to `await` them or chain `.then()/.catch()`. The CI-friendly pattern:

```ts
try {
  const hoppers = await ch.hoppers.list();
} catch (err) {
  if (err instanceof CryptohopperError) {
    console.error(err.code, err.status, err.message);
  } else {
    throw err;
  }
}
```

**"UNAUTHORIZED" on every call.** — check that `CRYPTOHOPPER_TOKEN` is set in the process you're actually running (`echo $CRYPTOHOPPER_TOKEN`) and that the token hasn't been revoked (visit the app page on cryptohopper.com).

**"FORBIDDEN" on endpoints that used to work.** — IP whitelisting is likely on for your app. The error envelope includes `ip_address` so you can see what IP Cryptohopper saw:

```ts
catch (err) {
  if (err instanceof CryptohopperError && err.code === "FORBIDDEN") {
    console.error(`Blocked from ${err.ipAddress}`);
  }
}
```

## Next steps

- [Authentication](Authentication) — deeper dive on tokens, app keys, IP whitelisting
- [Error Handling](Error-Handling) — every error code and how to recover
- [Recipes](Recipes) — canonical patterns for common tasks
