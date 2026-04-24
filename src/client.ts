import { CryptohopperError } from "./errors.js";
import { CURRENT_VERSION } from "./version.js";
import { User } from "./resources/user.js";
import { Hoppers } from "./resources/hoppers.js";
import { Exchange } from "./resources/exchange.js";
import { Strategies } from "./resources/strategy.js";
import { Backtests } from "./resources/backtest.js";
import { Market } from "./resources/market.js";
import { Signals } from "./resources/signals.js";
import { Arbitrage } from "./resources/arbitrage.js";
import { MarketMaker } from "./resources/marketmaker.js";
import { Templates } from "./resources/template.js";
import { AI } from "./resources/ai.js";
import { Platform } from "./resources/platform.js";
import { Chart } from "./resources/chart.js";
import { Subscription } from "./resources/subscription.js";
import { Social } from "./resources/social.js";
import { Tournaments } from "./resources/tournaments.js";
import { Webhooks } from "./resources/webhooks.js";
import { App } from "./resources/app.js";

const DEFAULT_BASE_URL = "https://api.cryptohopper.com/v1";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;

export interface CryptohopperClientOptions {
  /** OAuth2 bearer token (40-char). Issued via the Cryptohopper developer dashboard. */
  apiKey: string;
  /** Optional OAuth client_id. Sent as `x-api-app-key`. */
  appKey?: string;
  /** Override API base URL. Defaults to https://api.cryptohopper.com/v1. */
  baseUrl?: string;
  /** Inject a fetch implementation. Defaults to globalThis.fetch. */
  fetch?: typeof fetch;
  /** Per-request timeout in ms. */
  timeoutMs?: number;
  /** Max retries on 429 (respects Retry-After). Set to 0 to disable. */
  maxRetries?: number;
  /** Appended after "cryptohopper-sdk/<v>" in the User-Agent header. */
  userAgent?: string;
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Query-string parameters. Values coerced to strings; undefined values skipped. */
  query?: Record<string, string | number | boolean | undefined | null> | object;
  /** Override client-level maxRetries for this call. */
  maxRetries?: number;
}

interface ApiErrorBody {
  status?: number;
  code?: number;
  error?: number;
  message?: string;
  ip_address?: string;
}

interface ApiOkBody<T> {
  data: T;
}

export class CryptohopperClient {
  readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly appKey?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly userAgentSuffix?: string;

  readonly user: User;
  readonly hoppers: Hoppers;
  readonly exchange: Exchange;
  readonly strategy: Strategies;
  readonly backtest: Backtests;
  readonly market: Market;
  readonly signals: Signals;
  readonly arbitrage: Arbitrage;
  readonly marketmaker: MarketMaker;
  readonly template: Templates;
  readonly ai: AI;
  readonly platform: Platform;
  readonly chart: Chart;
  readonly subscription: Subscription;
  readonly social: Social;
  readonly tournaments: Tournaments;
  readonly webhooks: Webhooks;
  readonly app: App;

  constructor(opts: CryptohopperClientOptions) {
    if (!opts?.apiKey) {
      throw new TypeError("CryptohopperClient: `apiKey` is required");
    }
    this.apiKey = opts.apiKey;
    this.appKey = opts.appKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = opts.fetch ?? globalThis.fetch;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.userAgentSuffix = opts.userAgent;

    this.user = new User(this);
    this.hoppers = new Hoppers(this);
    this.exchange = new Exchange(this);
    this.strategy = new Strategies(this);
    this.backtest = new Backtests(this);
    this.market = new Market(this);
    this.signals = new Signals(this);
    this.arbitrage = new Arbitrage(this);
    this.marketmaker = new MarketMaker(this);
    this.template = new Templates(this);
    this.ai = new AI(this);
    this.platform = new Platform(this);
    this.chart = new Chart(this);
    this.subscription = new Subscription(this);
    this.social = new Social(this);
    this.tournaments = new Tournaments(this);
    this.webhooks = new Webhooks(this);
    this.app = new App(this);
  }

  async __request<T = unknown>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    let attempt = 0;
    while (true) {
      try {
        return await this.doRequest<T>(method, path, body, options);
      } catch (err) {
        if (
          err instanceof CryptohopperError &&
          err.code === "RATE_LIMITED" &&
          attempt < maxRetries
        ) {
          const waitMs = err.retryAfterMs ?? 1000 * 2 ** attempt;
          await sleep(waitMs);
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  private async doRequest<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body: unknown,
    options: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const ua = `cryptohopper-sdk/${CURRENT_VERSION}${this.userAgentSuffix ? ` ${this.userAgentSuffix}` : ""}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": ua,
      Accept: "application/json",
    };
    if (this.appKey) headers["x-api-app-key"] = this.appKey;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
    const signal = options.signal
      ? anySignal([options.signal, timeoutController.signal])
      : timeoutController.signal;

    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (err) {
      clearTimeout(timer);
      const aborted = (err as { name?: string }).name === "AbortError";
      if (aborted && options.signal?.aborted) {
        throw new CryptohopperError({
          code: "NETWORK_ERROR",
          message: "Request aborted",
          status: 0,
        });
      }
      throw new CryptohopperError({
        code: aborted ? "TIMEOUT" : "NETWORK_ERROR",
        message: aborted
          ? `Request timed out after ${timeoutMs}ms`
          : `Could not reach ${this.baseUrl} (${(err as Error).message})`,
        status: 0,
      });
    }
    clearTimeout(timer);

    const text = await res.text();
    let parsed: unknown = null;
    if (text.length > 0) {
      try {
        parsed = JSON.parse(text);
      } catch {
        /* non-JSON body — parsed stays null */
      }
    }

    if (!res.ok) {
      const body = parsed as ApiErrorBody | null;
      const code = defaultCodeForStatus(res.status);
      const message = body?.message ?? `Request failed (${res.status})`;
      const serverCode =
        body && typeof body.code === "number" && body.code > 0 ? body.code : undefined;
      const ipAddress = body?.ip_address;
      const retryAfter = res.headers.get("retry-after");
      const retryAfterMs = retryAfter ? parseRetryAfter(retryAfter) : undefined;
      throw new CryptohopperError({
        code,
        message,
        status: res.status,
        serverCode,
        ipAddress,
        retryAfterMs,
      });
    }

    const ok = parsed as ApiOkBody<T> | null;
    if (!ok || typeof ok !== "object" || !("data" in ok)) {
      return parsed as T;
    }
    return ok.data;
  }

  private buildUrl(path: string, query?: object): string {
    const base = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    if (!query) return base;
    const parts: string[] = [];
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
    if (parts.length === 0) return base;
    return `${base}${base.includes("?") ? "&" : "?"}${parts.join("&")}`;
  }
}

function defaultCodeForStatus(status: number): KnownCodeString {
  if (status === 400) return "VALIDATION_ERROR";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 402) return "DEVICE_UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION_ERROR";
  if (status === 429) return "RATE_LIMITED";
  if (status === 503) return "SERVICE_UNAVAILABLE";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

type KnownCodeString =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "DEVICE_UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "SERVER_ERROR"
  | "UNKNOWN";

function parseRetryAfter(header: string): number | undefined {
  const n = Number(header);
  if (Number.isFinite(n) && n >= 0) return Math.round(n * 1000);
  const date = Date.parse(header);
  if (Number.isFinite(date)) {
    const delta = date - Date.now();
    return delta > 0 ? delta : 0;
  }
  return undefined;
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const anyFn = (AbortSignal as unknown as { any?: (s: AbortSignal[]) => AbortSignal }).any;
  if (typeof anyFn === "function") return anyFn(signals);

  const ctrl = new AbortController();
  const forward = (s: AbortSignal) => {
    if (s.aborted) ctrl.abort(s.reason);
    else s.addEventListener("abort", () => ctrl.abort(s.reason), { once: true });
  };
  signals.forEach(forward);
  return ctrl.signal;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
