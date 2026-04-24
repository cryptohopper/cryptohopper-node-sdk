import type { CryptohopperClient } from "../client.js";

/**
 * A user's trading bot. Response includes many fields beyond these — the
 * server is the source of truth; unknown keys pass through on the object.
 */
export interface Hopper {
  id: number | string;
  name?: string;
  exchange?: string;
  enabled?: number | boolean;
  [key: string]: unknown;
}

export interface HopperPosition {
  hopper_id?: number | string;
  coin?: string;
  amount?: number | string;
  rate?: number | string;
  [key: string]: unknown;
}

export interface HopperOrder {
  id?: number | string;
  hopper_id?: number | string;
  market?: string;
  type?: string;
  amount?: number | string;
  price?: number | string;
  [key: string]: unknown;
}

export interface HoppersListParams {
  exchange?: string;
}

export interface BuySellInput {
  hopper_id: number | string;
  market: string;
  amount?: number | string;
  price?: number | string;
  [key: string]: unknown;
}

export class Hoppers {
  constructor(private readonly client: CryptohopperClient) {}

  /** List the authenticated user's hoppers. Requires `read`. */
  list(params?: HoppersListParams): Promise<Hopper[]> {
    return this.client.__request<Hopper[]>("GET", "/hopper/list", undefined, {
      query: params,
    });
  }

  /** Fetch a single hopper. Requires `read`. */
  get(hopperId: number | string): Promise<Hopper> {
    return this.client.__request<Hopper>("GET", "/hopper/get", undefined, {
      query: { hopper_id: hopperId },
    });
  }

  /** Create a new hopper. Requires `manage`. */
  create(input: Record<string, unknown>): Promise<Hopper> {
    return this.client.__request<Hopper>("POST", "/hopper/create", input);
  }

  /** Update an existing hopper. Requires `manage`. */
  update(hopperId: number | string, input: Record<string, unknown>): Promise<Hopper> {
    return this.client.__request<Hopper>("POST", "/hopper/update", {
      hopper_id: hopperId,
      ...input,
    });
  }

  /** Delete a hopper. Requires `manage`. */
  delete(hopperId: number | string): Promise<{ success?: boolean }> {
    return this.client.__request("POST", "/hopper/delete", { hopper_id: hopperId });
  }

  /** List open positions across a hopper. Requires `read`. */
  positions(hopperId: number | string): Promise<HopperPosition[]> {
    return this.client.__request<HopperPosition[]>(
      "GET",
      "/hopper/positions",
      undefined,
      { query: { hopper_id: hopperId } },
    );
  }

  /** Fetch a single position. Requires `read`. */
  position(
    hopperId: number | string,
    positionId: number | string,
  ): Promise<HopperPosition> {
    return this.client.__request<HopperPosition>(
      "GET",
      "/hopper/position",
      undefined,
      { query: { hopper_id: hopperId, position_id: positionId } },
    );
  }

  /** List recent orders for a hopper. Requires `read`. */
  orders(
    hopperId: number | string,
    params?: Record<string, string | number | undefined>,
  ): Promise<HopperOrder[]> {
    return this.client.__request<HopperOrder[]>("GET", "/hopper/orders", undefined, {
      query: { hopper_id: hopperId, ...params },
    });
  }

  /** Place a market/limit buy. Requires `trade`. Subject to the `order` rate bucket. */
  buy(input: BuySellInput): Promise<unknown> {
    return this.client.__request("POST", "/hopper/buy", input);
  }

  /** Place a market/limit sell. Requires `trade`. Subject to the `order` rate bucket. */
  sell(input: BuySellInput): Promise<unknown> {
    return this.client.__request("POST", "/hopper/sell", input);
  }

  /** Get the full config for a hopper. Requires `manage`. */
  configGet(hopperId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/hopper/configget", undefined, {
      query: { hopper_id: hopperId },
    });
  }

  /** Update the config for a hopper. Requires `manage`. */
  configUpdate(
    hopperId: number | string,
    config: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/hopper/configupdate", {
      hopper_id: hopperId,
      ...config,
    });
  }

  /** List config pools for a hopper. Requires `manage`. */
  configPools(hopperId: number | string): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/hopper/configpools", undefined, {
      query: { hopper_id: hopperId },
    });
  }

  /** Panic-sell everything. Requires `trade`. */
  panic(hopperId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/hopper/panic", { hopper_id: hopperId });
  }
}
