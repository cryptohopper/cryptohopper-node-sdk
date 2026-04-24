import type { CryptohopperClient } from "../client.js";

/**
 * `client.app` — mobile app store receipts + in-app purchases.
 *
 * Primarily used by the official Cryptohopper mobile apps; included in
 * the SDK for completeness.
 */
export class App {
  constructor(private readonly client: CryptohopperClient) {}

  /** Validate an App Store / Play Store receipt. */
  receipt(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/app/receipt", input);
  }

  /** Record an in-app purchase. */
  inAppPurchase(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/app/in_app_purchase", input);
  }
}
