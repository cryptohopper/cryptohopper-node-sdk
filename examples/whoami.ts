// Minimal authenticated request. Reads CRYPTOHOPPER_TOKEN from the env.
//
// Run: npx tsx whoami.ts

import { CryptohopperClient } from "@cryptohopper/sdk";

const token = process.env.CRYPTOHOPPER_TOKEN;
if (!token) {
  console.error("Set CRYPTOHOPPER_TOKEN to a 40-char OAuth bearer first.");
  process.exit(1);
}

const client = new CryptohopperClient({ apiKey: token });

const me = await client.user.get();
console.log(`User    : ${me.username ?? me.email ?? me.id}`);
console.log(`Email   : ${me.email ?? "(hidden)"}`);
console.log(`User ID : ${me.id}`);
