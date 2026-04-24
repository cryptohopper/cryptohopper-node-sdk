export type KnownCryptohopperErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "DEVICE_UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export type CryptohopperErrorCode = KnownCryptohopperErrorCode | (string & {});

export class CryptohopperError extends Error {
  readonly code: CryptohopperErrorCode;
  readonly status: number;
  readonly serverCode?: number;
  readonly ipAddress?: string;
  readonly retryAfterMs?: number;

  constructor(opts: {
    code: CryptohopperErrorCode;
    message: string;
    status: number;
    serverCode?: number;
    ipAddress?: string;
    retryAfterMs?: number;
  }) {
    super(opts.message);
    this.name = "CryptohopperError";
    this.code = opts.code;
    this.status = opts.status;
    this.serverCode = opts.serverCode;
    this.ipAddress = opts.ipAddress;
    this.retryAfterMs = opts.retryAfterMs;
  }
}
