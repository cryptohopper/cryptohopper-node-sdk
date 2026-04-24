import type { CryptohopperClient } from "../client.js";

/**
 * `client.webhooks` — developer webhook registration.
 *
 * Lets a third-party app register a URL that Cryptohopper will POST to
 * when certain account events happen (orders, signals, etc.). Maps to
 * the server's `/api/webhook_*` endpoints.
 */
export class Webhooks {
  constructor(private readonly client: CryptohopperClient) {}

  /**
   * Register a new webhook. The input should include the webhook URL and
   * the event types the app wants to subscribe to.
   */
  create(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/api/webhook_create", input);
  }

  /** Delete a registered webhook by id. */
  delete(webhookId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/api/webhook_delete", {
      webhook_id: webhookId,
    });
  }
}
