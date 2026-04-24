import type { CryptohopperClient } from "../client.js";

/**
 * User profile as returned by `GET /user/get`. Fields follow the server
 * response verbatim; extra fields the server adds in the future will be
 * present at runtime but not in this type.
 */
export interface UserProfile {
  id: string | number;
  email?: string;
  username?: string;
  is_trial_user?: string;
  userHash?: string;
  [key: string]: unknown;
}

export class User {
  constructor(private readonly client: CryptohopperClient) {}

  /** Fetch the authenticated user's profile. Requires `user` scope. */
  get(): Promise<UserProfile> {
    return this.client.__request<UserProfile>("GET", "/user/get");
  }
}
