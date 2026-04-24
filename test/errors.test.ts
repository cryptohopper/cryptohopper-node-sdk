import { describe, it, expect } from "vitest";
import { CryptohopperError } from "../src/errors.js";

describe("CryptohopperError", () => {
  it("captures code, status, message, serverCode and ipAddress", () => {
    const err = new CryptohopperError({
      code: "FORBIDDEN",
      message: "This action requires 'trade' permission scope.",
      status: 403,
      serverCode: 42,
      ipAddress: "203.0.113.42",
    });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(CryptohopperError);
    expect(err.name).toBe("CryptohopperError");
    expect(err.code).toBe("FORBIDDEN");
    expect(err.status).toBe(403);
    expect(err.serverCode).toBe(42);
    expect(err.ipAddress).toBe("203.0.113.42");
  });

  it("allows unknown string codes to pass through typed", () => {
    const err = new CryptohopperError({
      code: "SOMETHING_NEW_ON_SERVER" as never,
      message: "weird",
      status: 418,
    });
    expect(err.code).toBe("SOMETHING_NEW_ON_SERVER");
  });

  it("carries retryAfterMs when provided", () => {
    const err = new CryptohopperError({
      code: "RATE_LIMITED",
      message: "slow down",
      status: 429,
      retryAfterMs: 4000,
    });
    expect(err.retryAfterMs).toBe(4000);
  });
});
