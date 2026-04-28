// Demonstrate the typed error surface. Pass a bogus hopper ID to
// trigger a NOT_FOUND, and inspect every field on CryptohopperError.
//
// Run: npx tsx error-handling.ts <hopper-id-that-does-not-exist>
//
// The SDK auto-retries on 429 with backoff; if you want to see that path,
// hammer this in a loop and watch the retryAfterMs field on the final error.

import { CryptohopperClient, CryptohopperError } from "@cryptohopper/sdk";

const token = process.env.CRYPTOHOPPER_TOKEN;
if (!token) {
  console.error("Set CRYPTOHOPPER_TOKEN to a 40-char OAuth bearer first.");
  process.exit(1);
}

const hopperId = process.argv[2] ?? "999999999"; // unlikely to exist

const client = new CryptohopperClient({ apiKey: token });

try {
  const hopper = await client.hoppers.get(hopperId);
  console.log("Unexpectedly succeeded:", hopper);
} catch (e) {
  if (e instanceof CryptohopperError) {
    console.log("Caught CryptohopperError:");
    console.log(`  code         : ${e.code}`);
    console.log(`  status       : ${e.status}`);
    console.log(`  message      : ${e.message}`);
    console.log(`  serverCode   : ${e.serverCode ?? "(none)"}`);
    console.log(`  ipAddress    : ${e.ipAddress ?? "(none)"}`);
    console.log(`  retryAfterMs : ${e.retryAfterMs ?? "(only set on 429)"}`);

    // Codes are stable across every SDK — compare with `===`, never substring.
    if (e.code === "NOT_FOUND") {
      console.log("\nHandled NOT_FOUND specifically.");
    }
  } else {
    throw e;
  }
}
