import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { createMockFetch, type MockFetch } from "./helpers/mock-fetch.js";

function clientWith(mock: MockFetch) {
  return new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
}

describe("social resource", () => {
  it("getProfile sends alias", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { alias: "pim" } } });
    await clientWith(mock).social.getProfile("pim");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/social/getprofile?alias=pim",
    );
  });

  it("createPost → POST /social/post (server uses bare `post`)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 1 } } });
    await clientWith(mock).social.createPost({ content: "hi" });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/social/post");
  });

  it("getConversation → GET /social/loadconversation (server uses `loadconversation`)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).social.getConversation(42);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/social/loadconversation?conversation_id=42",
    );
  });

  it("like posts post_id", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).social.like(99);
    expect(mock.requests[0]!.method).toBe("POST");
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ post_id: 99 });
  });

  it("search → GET /social/search?q=rsi", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).social.search("rsi");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/social/search?q=rsi",
    );
  });
});

describe("tournaments resource", () => {
  it("list → GET /tournaments/gettournaments (server verb-prefix preserved)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).tournaments.list();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/tournaments/gettournaments",
    );
  });

  it("active → GET /tournaments/active", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).tournaments.active();
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/tournaments/active",
    );
  });

  it("tournamentLeaderboard → GET /tournaments/leaderboard_tournament (underscored server path)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: [] } });
    await clientWith(mock).tournaments.tournamentLeaderboard(7);
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/tournaments/leaderboard_tournament?tournament_id=7",
    );
  });

  it("join merges tournament_id into body", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).tournaments.join(5, { team: "alpha" });
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ tournament_id: 5, team: "alpha" });
  });
});

describe("webhooks resource (developer API)", () => {
  it("create → POST /api/webhook_create", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: { id: 1 } } });
    await clientWith(mock).webhooks.create({
      url: "https://example.com/hook",
      events: ["order.filled"],
    });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/api/webhook_create",
    );
  });

  it("delete → POST /api/webhook_delete with webhook_id", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).webhooks.delete(42);
    expect(JSON.parse(mock.requests[0]!.body!)).toEqual({ webhook_id: 42 });
  });
});

describe("app resource (mobile receipts)", () => {
  it("inAppPurchase → POST /app/in_app_purchase (underscored server path)", async () => {
    const mock = createMockFetch();
    mock.enqueue({ status: 200, body: { data: {} } });
    await clientWith(mock).app.inAppPurchase({ receipt: "abc" });
    expect(mock.requests[0]!.method).toBe("POST");
    expect(mock.requests[0]!.url).toBe(
      "https://api.cryptohopper.com/v1/app/in_app_purchase",
    );
  });
});
