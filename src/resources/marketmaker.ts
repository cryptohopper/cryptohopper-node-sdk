import type { CryptohopperClient } from "../client.js";

/**
 * `client.marketmaker` — market-maker bot operations: status, cancel,
 * market-trend overrides, and a backlog of pending orders.
 */
export class MarketMaker {
  constructor(private readonly client: CryptohopperClient) {}

  /** Fetch the market-maker bot state for a hopper. Requires `read`. */
  get(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/marketmaker/get", undefined, {
      query: params,
    });
  }

  /** Cancel running market-maker orders. Requires `trade`. */
  cancel(input: Record<string, unknown> = {}): Promise<unknown> {
    return this.client.__request("POST", "/marketmaker/cancel", input);
  }

  /** Historical order activity. Requires `read`. */
  history(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/marketmaker/history", undefined, {
      query: params,
    });
  }

  // ─── Market-trend overrides ──────────────────────────────────────────

  /** Read the current market-trend override. Requires `read`. */
  getMarketTrend(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/marketmaker/get-market-trend", undefined, {
      query: params,
    });
  }

  /** Set a market-trend override. Requires `manage`. */
  setMarketTrend(input: Record<string, unknown>): Promise<unknown> {
    return this.client.__request("POST", "/marketmaker/set-market-trend", input);
  }

  /** Remove the current market-trend override. Requires `manage`. */
  deleteMarketTrend(input: Record<string, unknown> = {}): Promise<unknown> {
    return this.client.__request("POST", "/marketmaker/delete-market-trend", input);
  }

  // ─── Backlog ─────────────────────────────────────────────────────────

  /** List queued/pending market-maker backlog items. Requires `read`. */
  backlogs(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/marketmaker/get-backlogs", undefined, {
      query: params,
    });
  }

  /** Fetch a single backlog item. Requires `read`. */
  backlog(id: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/marketmaker/get-backlog", undefined, {
      query: { backlog_id: id },
    });
  }

  /** Delete a backlog item. Requires `manage`. */
  deleteBacklog(id: number | string): Promise<unknown> {
    return this.client.__request("POST", "/marketmaker/delete-backlog", {
      backlog_id: id,
    });
  }
}
