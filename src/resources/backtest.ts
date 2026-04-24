import type { CryptohopperClient } from "../client.js";

export interface Backtest {
  id: number | string;
  hopper_id?: number | string;
  status?: string;
  [key: string]: unknown;
}

export interface BacktestLimits {
  /** Remaining backtests available this period. */
  remaining?: number;
  /** Period total. */
  limit?: number;
  [key: string]: unknown;
}

export class Backtests {
  constructor(private readonly client: CryptohopperClient) {}

  /** Start a new backtest. Requires `manage`. Subject to the `backtest` rate bucket. */
  create(input: Record<string, unknown>): Promise<Backtest> {
    return this.client.__request<Backtest>("POST", "/backtest/new", input);
  }

  /** Fetch a backtest. Requires `read`. */
  get(backtestId: number | string): Promise<Backtest> {
    return this.client.__request<Backtest>("GET", "/backtest/get", undefined, {
      query: { backtest_id: backtestId },
    });
  }

  /** List backtests. Requires `read`. */
  list(
    params?: Record<string, string | number | undefined>,
  ): Promise<Backtest[]> {
    return this.client.__request<Backtest[]>("GET", "/backtest/list", undefined, {
      query: params,
    });
  }

  /** Cancel a running backtest. Requires `manage`. */
  cancel(backtestId: number | string): Promise<{ success?: boolean }> {
    return this.client.__request("POST", "/backtest/cancel", {
      backtest_id: backtestId,
    });
  }

  /** Restart a backtest (with same parameters). Requires `manage`. */
  restart(backtestId: number | string): Promise<Backtest> {
    return this.client.__request<Backtest>("POST", "/backtest/restart", {
      backtest_id: backtestId,
    });
  }

  /** Get the user's current backtest quota. Requires `read`. */
  limits(): Promise<BacktestLimits> {
    return this.client.__request<BacktestLimits>("GET", "/backtest/limits");
  }
}
