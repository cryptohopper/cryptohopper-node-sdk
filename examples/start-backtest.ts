// Submit a 30-day backtest, then poll the status until it finishes.
// Backtests are async on the server side — `create` returns immediately
// with a backtest ID; you poll `get` to see when it completes.
//
// Run: npx tsx start-backtest.ts <hopper-id>
//
// Backtests are subject to the `backtest` rate bucket (separate from the
// normal request bucket). The SDK retries automatically on 429; if you
// see RATE_LIMITED here you've hit your daily quota — check
// `client.backtest.limits()` to see how many you have left.

import { CryptohopperClient, type Backtest } from "@cryptohopper/sdk";

const token = process.env.CRYPTOHOPPER_TOKEN;
if (!token) {
  console.error("Set CRYPTOHOPPER_TOKEN to a 40-char OAuth bearer first.");
  process.exit(1);
}

const hopperId = process.argv[2];
if (!hopperId) {
  console.error("Usage: npx tsx start-backtest.ts <hopper-id>");
  process.exit(1);
}

const client = new CryptohopperClient({ apiKey: token });

const limits = await client.backtest.limits();
console.log(`Quota remaining: ${limits.remaining ?? "?"} of ${limits.limit ?? "?"}`);

const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

console.log(`Submitting backtest for hopper ${hopperId} from ${fmt(thirtyDaysAgo)} to ${fmt(today)}...`);

const submitted = await client.backtest.create({
  hopper_id: hopperId,
  start_date: fmt(thirtyDaysAgo),
  end_date: fmt(today),
});

console.log(`Submitted backtest #${submitted.id}, polling for completion...`);

let backtest: Backtest = submitted;
const start = Date.now();
const TIMEOUT_MS = 5 * 60 * 1000;

while (backtest.status !== "completed" && backtest.status !== "failed") {
  if (Date.now() - start > TIMEOUT_MS) {
    console.error(`Timed out after ${TIMEOUT_MS / 1000}s — last status: ${backtest.status}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 5000));
  backtest = await client.backtest.get(submitted.id);
  process.stdout.write(`  status=${backtest.status}\r`);
}

console.log(`\nFinished with status: ${backtest.status}`);
console.log(JSON.stringify(backtest, null, 2));
