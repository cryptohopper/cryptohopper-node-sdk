export { CryptohopperClient } from "./client.js";
export type { CryptohopperClientOptions, RequestOptions } from "./client.js";
export { CryptohopperError } from "./errors.js";
export type {
  CryptohopperErrorCode,
  KnownCryptohopperErrorCode,
} from "./errors.js";
export { CURRENT_VERSION } from "./version.js";

export type { UserProfile } from "./resources/user.js";
export type {
  Hopper,
  HopperPosition,
  HopperOrder,
  HoppersListParams,
  BuySellInput,
} from "./resources/hoppers.js";
export type {
  Ticker,
  Candle,
  Orderbook,
  TickerParams,
  CandleParams,
  OrderbookParams,
} from "./resources/exchange.js";
export type { Strategy } from "./resources/strategy.js";
export type { Backtest, BacktestLimits } from "./resources/backtest.js";
export type { MarketItem, MarketSignal } from "./resources/market.js";
export type { Template } from "./resources/template.js";
