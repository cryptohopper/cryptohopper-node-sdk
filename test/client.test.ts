import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { CryptohopperError } from "../src/errors.js";
import { CURRENT_VERSION } from "../src/version.js";
import { createMockFetch } from "./helpers/mock-fetch.js";

describe("CryptohopperClient transport", () => {
  it("sends bearer + user-agent and unwraps the {data} envelope", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { hello: "world" } } });

    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
    const result = await client.__request<{ hello: string }>("GET", "/user/get");

    expect(result).toEqual({ hello: "world" });
    expect(mock.requests).toHaveLength(1);
    const req = mock.requests[0]!;
    expect(req.url).toBe("https://api.cryptohopper.com/v1/user/get");
    expect(req.method).toBe("GET");
    expect(req.headers["authorization"]).toBe("Bearer ch_abc");
    expect(req.headers["user-agent"]).toBe(`cryptohopper-sdk/${CURRENT_VERSION}`);
    expect(req.headers["x-api-app-key"]).toBeUndefined();
  });

  it("sends x-api-app-key when appKey is provided", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    const client = new CryptohopperClient({
      apiKey: "ch_abc",
      appKey: "client_123",
      fetch: mock.fetch,
    });

    await client.__request("GET", "/user/get");
    expect(mock.requests[0]!.headers["x-api-app-key"]).toBe("client_123");
  });

  it("attaches content-type only when a body is sent", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });

    await client.__request("POST", "/x", { foo: 1 });
    expect(mock.requests[0]!.headers["content-type"]).toBe("application/json");
    expect(mock.requests[0]!.body).toBe('{"foo":1}');
  });

  it("serialises query params", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });

    await client.__request("GET", "/exchange/ticker", undefined, {
      query: { exchange: "binance", market: "BTC/USDT", skip: undefined },
    });
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/exchange/ticker?exchange=binance&market=BTC%2FUSDT",
    );
  });

  it("throws a typed CryptohopperError on the Cryptohopper error envelope", async () => {
    const mock = createMockFetch();
    mock.enqueue({
      status: 403,
      body: {
        status: 403,
        code: 0,
        error: 1,
        message: "This action requires 'trade' permission scope.",
        ip_address: "203.0.113.42",
      },
    });
    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });

    await expect(client.__request("GET", "/x")).rejects.toMatchObject({
      name: "CryptohopperError",
      code: "FORBIDDEN",
      status: 403,
      message: "This action requires 'trade' permission scope.",
      ipAddress: "203.0.113.42",
    });
  });

  it("retries on 429 honouring Retry-After, then succeeds", async () => {
    const mock = createMockFetch();
    mock.enqueue({
      status: 429,
      body: {
        status: 429,
        code: 0,
        error: 1,
        message: "Rate limit reached",
      },
      headers: { "retry-after": "0" },
    });
    mock.enqueue({ status: 200, body: { data: { ok: true } } });

    const client = new CryptohopperClient({
      apiKey: "ch_abc",
      fetch: mock.fetch,
      maxRetries: 2,
    });
    const result = await client.__request<{ ok: boolean }>("GET", "/x");
    expect(result).toEqual({ ok: true });
    expect(mock.requests).toHaveLength(2);
  });

  it("gives up after maxRetries on persistent 429", async () => {
    const mock = createMockFetch();
    for (let i = 0; i < 3; i++) {
      mock.enqueue({
        status: 429,
        body: { status: 429, code: 0, error: 1, message: "Rate limit reached" },
        headers: { "retry-after": "0" },
      });
    }

    const client = new CryptohopperClient({
      apiKey: "ch_abc",
      fetch: mock.fetch,
      maxRetries: 2,
    });
    await expect(client.__request("GET", "/x")).rejects.toMatchObject({
      name: "CryptohopperError",
      code: "RATE_LIMITED",
      status: 429,
    });
    expect(mock.requests).toHaveLength(3);
  });

  it("maps a thrown fetch into NETWORK_ERROR with status 0", async () => {
    const mock = createMockFetch();
    mock.enqueueNetworkError("ECONNREFUSED");
    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });

    await expect(client.__request("GET", "/x")).rejects.toMatchObject({
      name: "CryptohopperError",
      code: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("falls back to SERVER_ERROR when the error body is non-JSON on 5xx", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 500 });
    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });

    await expect(client.__request("GET", "/x")).rejects.toMatchObject({
      code: "SERVER_ERROR",
      status: 500,
    });
  });

  it("honours a custom baseUrl", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    const client = new CryptohopperClient({
      apiKey: "ch_abc",
      baseUrl: "https://api-staging.cryptohopper.com/v1/",
      fetch: mock.fetch,
    });
    await client.__request("GET", "/user/get");
    expect(mock.requests[0]!.url).toBe("https://api-staging.cryptohopper.com/v1/user/get");
  });
});
