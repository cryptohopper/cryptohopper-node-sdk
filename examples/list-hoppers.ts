// List every hopper on the account, optionally filtered by exchange.
//
// Run: npx tsx list-hoppers.ts          (all hoppers)
//      npx tsx list-hoppers.ts binance  (only on Binance)

import { CryptohopperClient } from "@cryptohopper/sdk";

const token = process.env.CRYPTOHOPPER_TOKEN;
if (!token) {
  console.error("Set CRYPTOHOPPER_TOKEN to a 40-char OAuth bearer first.");
  process.exit(1);
}

const exchange = process.argv[2];

const client = new CryptohopperClient({ apiKey: token });

const hoppers = await client.hoppers.list(exchange ? { exchange } : undefined);

if (hoppers.length === 0) {
  console.log(exchange ? `No hoppers on ${exchange}.` : "No hoppers on this account.");
  process.exit(0);
}

console.log(`Found ${hoppers.length} hopper(s):`);
for (const h of hoppers) {
  const enabled = h.enabled === 1 || h.enabled === true ? "on " : "off";
  console.log(`  [${enabled}] #${h.id}  ${h.exchange ?? "?"}  ${h.name ?? "(unnamed)"}`);
}
