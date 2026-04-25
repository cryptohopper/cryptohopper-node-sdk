// Fetch a public ticker. Public endpoints don't need a token, but the
// SDK still requires *something* in `apiKey` — pass an empty string and
// any unauthenticated route just works.
//
// Run: npx tsx public-ticker.ts

import { CryptohopperClient } from "@cryptohopper/sdk";

const client = new CryptohopperClient({ apiKey: "" });

const ticker = await client.exchange.ticker({
  exchange: "binance",
  market: "BTC/USDT",
});

console.log(`BTC/USDT on Binance:`);
console.log(`  last : ${ticker.last}`);
console.log(`  bid  : ${ticker.bid}`);
console.log(`  ask  : ${ticker.ask}`);
console.log(`  vol  : ${ticker.volume ?? "(unavailable)"}`);
