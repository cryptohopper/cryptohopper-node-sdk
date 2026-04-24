import type { CryptohopperClient } from "../client.js";

/**
 * `client.subscription` — plan info, per-hopper subscription state, credits,
 * and (via `orderSub` / `stopSubscription`) billing flows.
 *
 * `subscription.hopper(hopperId)` inspects the subscription slot assigned to
 * a specific bot; `subscription.get()` returns the account-level state.
 */
export class Subscription {
  constructor(private readonly client: CryptohopperClient) {}

  /** Subscription state for a specific hopper. Requires `read`. */
  hopper(hopperId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/subscription/hopper", undefined, {
      query: { hopper_id: hopperId },
    });
  }

  /** Account-level subscription state. Requires `read`. */
  get(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/subscription/get");
  }

  /** List available subscription plans. Public. */
  plans(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/subscription/plans");
  }

  /** Move a subscription slot from one hopper to another. Requires `manage`. */
  remap(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/subscription/remap", input);
  }

  /** Assign a subscription slot to a hopper. Requires `manage`. */
  assign(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/subscription/assign", input);
  }

  /** Remaining platform credits on the account. Requires `read`. */
  getCredits(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/subscription/getcredits");
  }

  /** Start a subscription purchase. Requires `user`. */
  orderSub(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/subscription/ordersub", input);
  }

  /** Cancel / stop an active subscription. Requires `user`. */
  stopSubscription(
    input: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/subscription/stopsubscription", input);
  }
}
