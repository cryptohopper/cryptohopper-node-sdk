import type { CryptohopperClient } from "../client.js";

export interface Strategy {
  id: number | string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export class Strategies {
  constructor(private readonly client: CryptohopperClient) {}

  /** List all strategies owned by the user. Requires `read`. */
  list(): Promise<Strategy[]> {
    return this.client.__request<Strategy[]>("GET", "/strategy/strategies");
  }

  /** Fetch a strategy. Requires `read`. */
  get(strategyId: number | string): Promise<Strategy> {
    return this.client.__request<Strategy>("GET", "/strategy/get", undefined, {
      query: { strategy_id: strategyId },
    });
  }

  /** Create a new strategy. Requires `manage`. */
  create(input: Record<string, unknown>): Promise<Strategy> {
    return this.client.__request<Strategy>("POST", "/strategy/create", input);
  }

  /** Edit an existing strategy. Requires `manage`. */
  update(
    strategyId: number | string,
    input: Record<string, unknown>,
  ): Promise<Strategy> {
    return this.client.__request<Strategy>("POST", "/strategy/edit", {
      strategy_id: strategyId,
      ...input,
    });
  }

  /** Delete a strategy. Requires `manage`. */
  delete(strategyId: number | string): Promise<{ success?: boolean }> {
    return this.client.__request("POST", "/strategy/delete", {
      strategy_id: strategyId,
    });
  }
}
