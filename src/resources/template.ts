import type { CryptohopperClient } from "../client.js";

/**
 * `client.template` — bot templates (reusable hopper configurations).
 */
export interface Template {
  id: number | string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export class Templates {
  constructor(private readonly client: CryptohopperClient) {}

  /** List all templates available to the user. Requires `read`. */
  list(): Promise<Template[]> {
    return this.client.__request<Template[]>("GET", "/template/templates");
  }

  /** Fetch a single template. Requires `read`. */
  get(templateId: number | string): Promise<Template> {
    return this.client.__request<Template>("GET", "/template/get", undefined, {
      query: { template_id: templateId },
    });
  }

  /** Fetch the basic (lightweight) view of a template. Requires `read`. */
  basic(templateId: number | string): Promise<Template> {
    return this.client.__request<Template>("GET", "/template/basic", undefined, {
      query: { template_id: templateId },
    });
  }

  /** Save a new template from a hopper's config. Requires `manage`. */
  save(input: Record<string, unknown>): Promise<Template> {
    return this.client.__request<Template>("POST", "/template/save-template", input);
  }

  /** Update an existing template's metadata or config. Requires `manage`. */
  update(
    templateId: number | string,
    input: Record<string, unknown>,
  ): Promise<Template> {
    return this.client.__request<Template>("POST", "/template/update", {
      template_id: templateId,
      ...input,
    });
  }

  /** Apply a template to a hopper. Requires `manage`. */
  load(templateId: number | string, hopperId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/template/load", {
      template_id: templateId,
      hopper_id: hopperId,
    });
  }

  /** Delete a template. Requires `manage`. */
  delete(templateId: number | string): Promise<{ success?: boolean }> {
    return this.client.__request("POST", "/template/delete", {
      template_id: templateId,
    });
  }
}
