import type { CryptohopperClient } from "../client.js";

export interface MarketItem {
  id: number | string;
  name?: string;
  type?: string;
  [key: string]: unknown;
}

export interface MarketSignal {
  id: number | string;
  exchange?: string;
  market?: string;
  type?: "buy" | "sell" | string;
  [key: string]: unknown;
}

export class Market {
  constructor(private readonly client: CryptohopperClient) {}

  /** Browse marketplace signals. Public — no auth required. */
  signals(
    params?: Record<string, string | number | undefined>,
  ): Promise<MarketSignal[]> {
    return this.client.__request<MarketSignal[]>("GET", "/market/signals", undefined, {
      query: params,
    });
  }

  /** Fetch a marketplace signal. Public — no auth required. */
  signal(signalId: number | string): Promise<MarketSignal> {
    return this.client.__request<MarketSignal>("GET", "/market/signal", undefined, {
      query: { signal_id: signalId },
    });
  }

  /** Browse marketplace items (strategies, templates, signals, …). Public. */
  items(
    params?: Record<string, string | number | undefined>,
  ): Promise<MarketItem[]> {
    return this.client.__request<MarketItem[]>(
      "GET",
      "/market/marketitems",
      undefined,
      { query: params },
    );
  }

  /** Fetch a single marketplace item. Public. */
  item(itemId: number | string): Promise<MarketItem> {
    return this.client.__request<MarketItem>("GET", "/market/marketitem", undefined, {
      query: { item_id: itemId },
    });
  }

  /** Marketplace homepage. Public. */
  homepage(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/market/homepage");
  }
}
