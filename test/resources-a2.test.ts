import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { createMockFetch, type MockFetch } from "./helpers/mock-fetch.js";

function clientWith(mock: MockFetch) {
  return new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
}

describe("ai resource", () => {
  it("availableModels → GET /ai/availablemodels", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).ai.availableModels();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/ai/availablemodels",
    );
  });

  it("getCredits → GET /ai/getaicredits (server-prefix preserved)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { balance: 100 } } });
    const r = await clientWith(mock).ai.getCredits();
    expect(r["balance"]).toBe(100);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/ai/getaicredits",
    );
  });

  it("llmAnalyze → POST /ai/doaillmanalyze", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { job_id: 7 } } });
    await clientWith(mock).ai.llmAnalyze({ strategy_id: 42 });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/ai/doaillmanalyze",
    );
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ strategy_id: 42 });
  });
});

describe("platform resource", () => {
  it("latestBlog → GET /platform/latestblog", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).platform.latestBlog();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/platform/latestblog",
    );
  });

  it("searchDocumentation(q) → GET /platform/searchdocumentation?q=rsi", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).platform.searchDocumentation("rsi");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/platform/searchdocumentation?q=rsi",
    );
  });

  it("botTypes → GET /platform/bottypes", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).platform.botTypes();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/platform/bottypes",
    );
  });
});

describe("chart resource", () => {
  it("list → GET /chart/list", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).chart.list();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/chart/list",
    );
  });

  it("shareSave → POST /chart/share-save (hyphenated path)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { share_id: "abc" } } });
    await clientWith(mock).chart.shareSave({ title: "BTC chart" });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/chart/share-save",
    );
  });

  it("delete → POST /chart/delete with chart_id", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).chart.delete(5);
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ chart_id: 5 });
  });
});

describe("subscription resource", () => {
  it("plans → GET /subscription/plans", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).subscription.plans();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/subscription/plans",
    );
  });

  it("hopper(id) → GET /subscription/hopper?hopper_id=42", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).subscription.hopper(42);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/subscription/hopper?hopper_id=42",
    );
  });

  it("stopSubscription → POST /subscription/stopsubscription", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).subscription.stopSubscription();
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/subscription/stopsubscription",
    );
  });
});
