import type { CryptohopperClient } from "../client.js";

/**
 * `client.ai` — AI assistant features: credit balance, LLM-backed
 * strategy/market analysis, and credit top-ups.
 *
 * Method names drop the `ai*` server-prefix where it would be redundant
 * under the `ai.` namespace (`getaicredits` → `getCredits`, `aillmresults`
 * → `llmResults`, etc.).
 */
export class AI {
  constructor(private readonly client: CryptohopperClient) {}

  /** List AI assistant items / sessions. Requires `read`. */
  list(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/ai/list", undefined, { query: params });
  }

  /** Fetch a single AI item / session. Requires `read`. */
  get(id: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/ai/get", undefined, { query: { id } });
  }

  /** Models available to the authenticated user. */
  availableModels(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/ai/availablemodels");
  }

  // ─── Credits ─────────────────────────────────────────────────────────

  /** Remaining AI credit balance. Requires `read`. */
  getCredits(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/ai/getaicredits");
  }

  /** Past invoices for AI-credit purchases. Requires `read`. */
  creditInvoices(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/ai/aicreditinvoices", undefined, {
      query: params,
    });
  }

  /** Credit spend/top-up transaction history. Requires `read`. */
  creditTransactions(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/ai/aicredittransactions", undefined, {
      query: params,
    });
  }

  /** Start a purchase of additional credits. Requires `user`. */
  buyCredits(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/ai/buyaicredits", input);
  }

  // ─── LLM analysis ────────────────────────────────────────────────────

  /** Options/metadata for the LLM analyse endpoint. Requires `read`. */
  llmAnalyzeOptions(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/ai/aillmanalyzeoptions");
  }

  /** Run an LLM analysis. Requires `manage`. Usually async — returns a job id. */
  llmAnalyze(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/ai/doaillmanalyze", input);
  }

  /** Fetch the result(s) of an LLM analysis. Requires `read`. */
  llmAnalyzeResults(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/ai/aillmanalyzeresults", undefined, {
      query: params,
    });
  }

  /** Historical LLM analysis results. Requires `read`. */
  llmResults(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/ai/aillmresults", undefined, {
      query: params,
    });
  }
}
