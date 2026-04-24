import type { CryptohopperClient } from "../client.js";

/**
 * `client.signals` — analytics for signal providers (a different surface
 * from the marketplace browse under `client.market.signals`).
 *
 * All endpoints here are read-only stats the server exposes for the
 * authenticated user's signal-provider account.
 */
export class Signals {
  constructor(private readonly client: CryptohopperClient) {}

  /** List the signals this provider has published. */
  list(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/signals/signals", undefined, {
      query: params,
    });
  }

  /** Performance stats (winrate, avg profit per signal, etc.). */
  performance(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/signals/performance", undefined, {
      query: params,
    });
  }

  /** Overall provider stats (subscriber count, total PnL, etc.). */
  stats(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/signals/stats");
  }

  /** Distribution of signals across exchanges / markets / types. */
  distribution(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/signals/distribution");
  }

  /** Data series for charting the provider's performance over time. */
  chartData(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/signals/chartdata", undefined, {
      query: params,
    });
  }
}
