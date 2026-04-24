import type { CryptohopperClient } from "../client.js";

export interface Ticker {
  market?: string;
  last?: number | string;
  bid?: number | string;
  ask?: number | string;
  volume?: number | string;
  [key: string]: unknown;
}

export interface Candle {
  time?: number;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string;
  volume?: number | string;
  [key: string]: unknown;
}

export interface Orderbook {
  bids?: Array<[number | string, number | string]>;
  asks?: Array<[number | string, number | string]>;
  [key: string]: unknown;
}

export interface TickerParams {
  exchange: string;
  market: string;
}

export interface CandleParams {
  exchange: string;
  market: string;
  /** e.g. "1m", "5m", "1h", "1d" */
  timeframe: string;
  from?: number;
  to?: number;
}

export interface OrderbookParams {
  exchange: string;
  market: string;
}

export class Exchange {
  constructor(private readonly client: CryptohopperClient) {}

  /** Current ticker for a market on an exchange. Public — no auth required. */
  ticker(params: TickerParams): Promise<Ticker> {
    return this.client.__request<Ticker>("GET", "/exchange/ticker", undefined, {
      query: { ...params },
    });
  }

  /** OHLCV candles. Public — no auth required. */
  candles(params: CandleParams): Promise<Candle[]> {
    return this.client.__request<Candle[]>("GET", "/exchange/candle", undefined, {
      query: { ...params },
    });
  }

  /** Order book depth for a market. Public — no auth required. */
  orderbook(params: OrderbookParams): Promise<Orderbook> {
    return this.client.__request<Orderbook>("GET", "/exchange/orderbook", undefined, {
      query: { ...params },
    });
  }

  /** List markets available on an exchange. */
  markets(exchange: string): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/exchange/markets", undefined, {
      query: { exchange },
    });
  }

  /** List currencies available on an exchange. */
  currencies(exchange: string): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/exchange/currencies", undefined, {
      query: { exchange },
    });
  }

  /** List all supported exchanges. */
  exchanges(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/exchange/exchanges");
  }

  /** Fiat forex rates used for conversion. */
  forexRates(): Promise<Record<string, number | string>> {
    return this.client.__request("GET", "/exchange/forex-rates");
  }
}
