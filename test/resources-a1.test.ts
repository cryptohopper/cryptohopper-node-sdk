import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { createMockFetch, type MockFetch } from "./helpers/mock-fetch.js";

function clientWith(mock: MockFetch) {
  return new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
}

describe("signals resource", () => {
  it("list → GET /signals/signals", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).signals.list();
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/signals/signals");
  });

  it("performance → GET /signals/performance", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { winrate: 0.6 } } });
    const r = await clientWith(mock).signals.performance();
    expect(r["winrate"]).toBe(0.6);
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/signals/performance");
  });

  it("chartData → GET /signals/chartdata (single word)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).signals.chartData();
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/signals/chartdata");
  });
});

describe("arbitrage resource", () => {
  it("exchangeStart → POST /arbitrage/exchange", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).arbitrage.exchangeStart({ hopper_id: 1 });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/arbitrage/exchange");
  });

  it("marketStart → POST /arbitrage/market (distinct from exchange)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).arbitrage.marketStart({ hopper_id: 2 });
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/arbitrage/market");
  });

  it("marketCancel hits /arbitrage/market-cancel (hyphenated path)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).arbitrage.marketCancel();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/arbitrage/market-cancel",
    );
  });

  it("backlogs → GET /arbitrage/get-backlogs", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).arbitrage.backlogs();
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/arbitrage/get-backlogs");
  });

  it("deleteBacklog → POST /arbitrage/delete-backlog with backlog_id", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).arbitrage.deleteBacklog(7);
    expect(mock.requests[0]!.method).toBe("POST");
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ backlog_id: 7 });
  });
});

describe("marketmaker resource", () => {
  it("get → GET /marketmaker/get", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).marketmaker.get({ hopper_id: 1 });
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/marketmaker/get?hopper_id=1",
    );
  });

  it("setMarketTrend → POST /marketmaker/set-market-trend", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).marketmaker.setMarketTrend({ hopper_id: 1, trend: "bull" });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/marketmaker/set-market-trend",
    );
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ hopper_id: 1, trend: "bull" });
  });

  it("backlog → GET /marketmaker/get-backlog?backlog_id=9", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 9 } } });
    await clientWith(mock).marketmaker.backlog(9);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/marketmaker/get-backlog?backlog_id=9",
    );
  });
});

describe("template resource", () => {
  it("list → GET /template/templates", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).template.list();
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/template/templates");
  });

  it("get → GET /template/get?template_id=3", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 3 } } });
    await clientWith(mock).template.get(3);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/template/get?template_id=3",
    );
  });

  it("save → POST /template/save-template", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 4 } } });
    await clientWith(mock).template.save({ name: "my template", hopper_id: 1 });
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/template/save-template",
    );
  });

  it("load → POST /template/load with template_id + hopper_id", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).template.load(3, 5);
    expect(mock.requests[0]!.method).toBe("POST");
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ template_id: 3, hopper_id: 5 });
  });
});
