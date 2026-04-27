// Fetch the current BTC/USDT spot price on Binance.
//
// Even though the *data* returned is "public" (not tied to your account),
// the API gateway requires a real OAuth bearer on every call — there are
// no anonymous routes today. Set CRYPTOHOPPER_TOKEN before running.
//
// Run: npx tsx ticker.ts

import { CryptohopperClient } from "@cryptohopper/sdk";

const token = process.env.CRYPTOHOPPER_TOKEN;
if (!token) {
  console.error("Set CRYPTOHOPPER_TOKEN to a 40-char OAuth bearer first.");
  process.exit(1);
}

const client = new CryptohopperClient({ apiKey: token });

const ticker = await client.exchange.ticker({
  exchange: "binance",
  market: "BTC/USDT",
});

console.log(`BTC/USDT on Binance:`);
console.log(`  last : ${ticker.last}`);
console.log(`  bid  : ${ticker.bid}`);
console.log(`  ask  : ${ticker.ask}`);
console.log(`  vol  : ${ticker.volume ?? "(unavailable)"}`);
