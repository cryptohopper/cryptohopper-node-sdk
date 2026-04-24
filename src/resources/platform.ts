import type { CryptohopperClient } from "../client.js";

/**
 * `client.platform` — marketing/i18n/discovery reads.
 *
 * All endpoints under `platform.*` are whitelisted on the server side and
 * require no authentication.
 */
export class Platform {
  constructor(private readonly client: CryptohopperClient) {}

  /** Latest blog posts. Public. */
  latestBlog(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/platform/latestblog", undefined, {
      query: params,
    });
  }

  /** Documentation articles. Public. */
  documentation(
    params?: Record<string, string | number | undefined>,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/platform/documentation", undefined, {
      query: params,
    });
  }

  /** Active promo bar content. Public. */
  promoBar(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/platform/promobar");
  }

  /** Full-text search across public documentation. Public. */
  searchDocumentation(
    query: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request(
      "GET",
      "/platform/searchdocumentation",
      undefined,
      { query: { q: query } },
    );
  }

  /** Full list of countries (ISO codes + display names). Public. */
  countries(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/platform/countries");
  }

  /** Countries the platform currently allows. Public. */
  countryAllowlist(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/platform/countryallowlist");
  }

  /** Country resolved from the caller's IP. Public. */
  ipCountry(): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/platform/ipcountry");
  }

  /** Supported UI languages. Public. */
  languages(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/platform/languages");
  }

  /** Enumeration of available bot types (normal, grid, signal, …). Public. */
  botTypes(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/platform/bottypes");
  }
}
