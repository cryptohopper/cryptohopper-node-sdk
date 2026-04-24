import type { CryptohopperClient } from "../client.js";

/**
 * `client.arbitrage` — exchange + market arbitrage operations.
 *
 * Two distinct flavours:
 *   • `exchange*` — cross-exchange arbitrage (buy on A, sell on B).
 *   • `market*`   — intra-exchange market arbitrage (e.g. triangular).
 * Plus a shared `backlog` concept for queued / cancelled opportunities.
 */
export class Arbitrage {
  constructor(private readonly client: CryptohopperClient) {}

  // ─── Cross-exchange arbitrage ─────────────────────────────────────────

  /** Start a cross-exchange arbitrage run. Requires `trade`. */
  exchangeStart(input: Record<string, unknown>): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/exchange", input);
  }

  /** Cancel a cross-exchange arbitrage run. Requires `trade`. */
  exchangeCancel(input: Record<string, unknown> = {}): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/cancel", input);
  }

  /** Fetch results of exchange arbitrage runs. Requires `read`. */
  exchangeResults(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/arbitrage/results", undefined, {
      query: params,
    });
  }

  /** Historical runs. Requires `read`. */
  exchangeHistory(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/arbitrage/history", undefined, {
      query: params,
    });
  }

  /** Aggregated totals across all exchange-arbitrage runs. Requires `read`. */
  exchangeTotal(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/arbitrage/total");
  }

  /** Reset the running totals. Requires `manage`. */
  exchangeResetTotal(): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/resettotal", {});
  }

  // ─── Intra-exchange market arbitrage ──────────────────────────────────

  /** Start an intra-exchange (e.g. triangular) arbitrage run. Requires `trade`. */
  marketStart(input: Record<string, unknown>): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/market", input);
  }

  /** Cancel a market-arbitrage run. Requires `trade`. */
  marketCancel(input: Record<string, unknown> = {}): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/market-cancel", input);
  }

  /** Result of a specific market arb. Requires `read`. */
  marketResult(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/arbitrage/market-result", undefined, {
      query: params,
    });
  }

  /** Historical market-arb runs. Requires `read`. */
  marketHistory(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/arbitrage/market-history", undefined, {
      query: params,
    });
  }

  // ─── Backlog (shared) ────────────────────────────────────────────────

  /** List queued/pending arbitrage backlog items. Requires `read`. */
  backlogs(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/arbitrage/get-backlogs", undefined, {
      query: params,
    });
  }

  /** Fetch a single backlog item. Requires `read`. */
  backlog(id: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/arbitrage/get-backlog", undefined, {
      query: { backlog_id: id },
    });
  }

  /** Delete a backlog item. Requires `manage`. */
  deleteBacklog(id: number | string): Promise<unknown> {
    return this.client.__request("POST", "/arbitrage/delete-backlog", {
      backlog_id: id,
    });
  }
}
