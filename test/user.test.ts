import { describe, it, expect } from "vitest";
import { CryptohopperClient } from "../src/client.js";
import { createMockFetch } from "./helpers/mock-fetch.js";

describe("user resource", () => {
  it("user.get() hits GET /user/get and returns the unwrapped profile", async () => {
    const mock = createMockFetch();
    mock.enqueue({
      status: 200,
      body: {
        data: {
          id: 42,
          email: "test@example.com",
          username: "pim",
          is_trial_user: "0",
          userHash: "abc123",
        },
      },
    });

    const client = new CryptohopperClient({ apiKey: "ch_abc", fetch: mock.fetch });
    const profile = await client.user.get();

    expect(profile.id).toBe(42);
    expect(profile.email).toBe("test@example.com");
    expect(profile.username).toBe("pim");
    expect(profile.userHash).toBe("abc123");
    expect(mock.requests[0]!.url).toBe("https://api.cryptohopper.com/v1/user/get");
    expect(mock.requests[0]!.method).toBe("GET");
  });
});
