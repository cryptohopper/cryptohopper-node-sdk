import type { CryptohopperClient } from "../client.js";

/**
 * `client.chart` — saved TradingView-style chart layouts (the server-side
 * counterpart of the in-app chart saver). Separate from the shared-link
 * variants (`shareSave` / `shareGet`).
 */
export class Chart {
  constructor(private readonly client: CryptohopperClient) {}

  /** List the user's saved charts. Requires `read`. */
  list(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/chart/list");
  }

  /** Fetch a single saved chart. Requires `read`. */
  get(chartId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/chart/get", undefined, {
      query: { chart_id: chartId },
    });
  }

  /** Save a new chart layout. Requires `manage`. */
  save(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/chart/save", input);
  }

  /** Delete a saved chart. Requires `manage`. */
  delete(chartId: number | string): Promise<{ success?: boolean }> {
    return this.client.__request("POST", "/chart/delete", { chart_id: chartId });
  }

  /** Save a shared (public-link) chart. Requires `manage`. */
  shareSave(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/chart/share-save", input);
  }

  /** Fetch a shared chart by its share id / key. Public. */
  shareGet(shareId: string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/chart/share-get", undefined, {
      query: { share_id: shareId },
    });
  }
}
