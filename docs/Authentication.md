# Authentication

Every SDK request (except a handful of public endpoints like `/exchange/ticker` and `/market/homepage`) requires an OAuth2 bearer token:

```
Authorization: Bearer <40-char token>
```

## Obtaining a token

1. Log in to [cryptohopper.com](https://www.cryptohopper.com).
2. Developer → Create App — gives you a `client_id` + `client_secret`.
3. Complete the OAuth consent flow for your app, which returns a bearer token.

Options to automate step 3:

- **The official CLI**: `cryptohopper login` opens the consent page, runs a loopback listener, and persists the token to `~/.cryptohopper/config.json`. You can then read the token from there or run the CLI and the SDK side-by-side.
- **Your own code**: call the server's `/oauth2/authorize` + `/oauth2/token` endpoints directly. The CLI's implementation is short (~300 lines in [`src/auth/browser-flow.ts`](https://github.com/cryptohopper/cryptohopper-cli/blob/main/src/auth/browser-flow.ts)) and a reasonable reference.

## Client construction

```ts
import { CryptohopperClient } from "@cryptohopper/sdk";

const ch = new CryptohopperClient({
  apiKey: process.env.CRYPTOHOPPER_TOKEN!,
  appKey: process.env.CRYPTOHOPPER_APP_KEY, // optional
  baseUrl: "https://api.cryptohopper.com/v1", // default
  timeoutMs: 30_000,
  maxRetries: 3,
});
```

All options are optional except `apiKey`.

### `appKey`

Cryptohopper lets OAuth apps identify themselves on every request via the `x-api-app-key` header (value = your OAuth `client_id`). Set `appKey` on the client and the SDK will add that header automatically. This:

- Shows up in Cryptohopper's server-side telemetry so you can attribute your own traffic.
- Is used for per-app rate limits — if two apps share a token, they have independent quotas.
- Is harmless to omit — the server accepts unattributed requests.

### `baseUrl`

Override for staging or a local dev server. The default is `https://api.cryptohopper.com/v1`. The trailing `/v1` is part of the base; your resource paths are relative to it.

## IP whitelisting

If your Cryptohopper app has IP allowlisting on, requests from unlisted IPs return `403 FORBIDDEN`. The SDK surfaces this as `CryptohopperError` with `code: "FORBIDDEN"` and a populated `ipAddress` field showing the IP Cryptohopper saw:

```ts
try {
  await ch.hoppers.list();
} catch (err) {
  if (err instanceof CryptohopperError && err.code === "FORBIDDEN") {
    console.error(`Blocked from ${err.ipAddress}`);
  }
}
```

For CI where the runner IP isn't stable, either disable IP allowlisting for that app, or add a stable outbound IP (e.g. via a VPN gateway).

## Rotating tokens

Cryptohopper bearer tokens are long-lived but can be revoked:

- From the Cryptohopper dashboard (app settings → revoke).
- Automatically when the user revokes consent.

The SDK surfaces revocation as `UNAUTHORIZED` on the next call. There is no automatic refresh-token handling in the SDK today — if your app uses refresh tokens, handle the `UNAUTHORIZED` branch by exchanging your refresh token for a new access token, then retrying:

```ts
async function withAutoRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof CryptohopperError && err.code === "UNAUTHORIZED") {
      await refreshMyToken(); // your code
      ch.setApiKey(myStore.token); // not provided — construct a new client
      return await fn();
    }
    throw err;
  }
}
```

(Note: there's no `setApiKey()` on the client — to change tokens you must construct a new `CryptohopperClient`. This is intentional: the client is cheap to construct and keeping it immutable avoids subtle races.)
