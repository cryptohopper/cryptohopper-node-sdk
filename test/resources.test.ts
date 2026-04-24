import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { createMockFetch, type MockFetch } from "./helpers/mock-fetch.js";

function clientWith(mock: MockFetch) {
  return new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
}

describe("hoppers resource", () => {
  it("list → GET /hopper/list with exchange filter", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).hoppers.list({ exchange: "binance" });
    expect(mock.requests[0]!.method).toBe("GET");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/hopper/list?exchange=binance",
    );
  });

  it("get → GET /hopper/get?hopper_id=42", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 42 } } });
    await clientWith(mock).hoppers.get(42);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/hopper/get?hopper_id=42",
    );
  });

  it("buy → POST /hopper/buy with JSON body", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).hoppers.buy({
      hopper_id: 42,
      market: "BTC/USDT",
      amount: "0.001",
    });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/hopper/buy");
    expect(mock.requests[0]!.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({
      hopper_id: 42,
      market: "BTC/USDT",
      amount: "0.001",
    });
  });

  it("configUpdate merges hopper_id into body", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).hoppers.configUpdate(7, { strategy_id: 99 });
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({
      hopper_id: 7,
      strategy_id: 99,
    });
  });

  it("panic → POST /hopper/panic", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).hoppers.panic(5);
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/hopper/panic");
  });
});

describe("exchange resource", () => {
  it("ticker → GET /exchange/ticker with exchange + market", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { last: 42000 } } });
    const t = await clientWith(mock).exchange.ticker({
      exchange: "binance",
      market: "BTC/USDT",
    });
    expect(t.last).toBe(42000);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/exchange/ticker?exchange=binance&market=BTC%2FUSDT",
    );
  });

  it("candles → GET /exchange/candle with timeframe", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).exchange.candles({
      exchange: "binance",
      market: "BTC/USDT",
      timeframe: "1h",
    });
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/exchange/candle?exchange=binance&market=BTC%2FUSDT&timeframe=1h",
    );
  });

  it("exchanges → GET /exchange/exchanges without auth params", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).exchange.exchanges();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/exchange/exchanges",
    );
  });
});

describe("strategy resource", () => {
  it("list → GET /strategy/strategies (server uses plural)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).strategy.list();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/strategy/strategies",
    );
  });

  it("update → POST /strategy/edit (server uses 'edit')", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).strategy.update(5, { name: "renamed" });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/strategy/edit",
    );
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({
      strategy_id: 5,
      name: "renamed",
    });
  });
});

describe("backtest resource", () => {
  it("create → POST /backtest/new (server uses 'new')", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 1 } } });
    await clientWith(mock).backtest.create({ hopper_id: 42 });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/backtest/new",
    );
  });

  it("limits → GET /backtest/limits", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { remaining: 3, limit: 5 } } });
    const l = await clientWith(mock).backtest.limits();
    expect(l.remaining).toBe(3);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/backtest/limits",
    );
  });
});

describe("market resource", () => {
  it("items → GET /market/marketitems (server uses 'marketitems')", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).market.items({ type: "strategy" });
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/market/marketitems?type=strategy",
    );
  });

  it("signal → GET /market/signal?signal_id=99", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 99 } } });
    await clientWith(mock).market.signal(99);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/market/signal?signal_id=99",
    );
  });
});
