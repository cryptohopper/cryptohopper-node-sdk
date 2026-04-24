import type { CryptohopperClient } from "../client.js";

/**
 * `client.tournaments` — trading competitions: list + leaderboards + join/leave.
 */
export class Tournaments {
  constructor(private readonly client: CryptohopperClient) {}

  /** List all tournaments (past, present, future). Requires `read`. */
  list(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/gettournaments", undefined, {
      query: params,
    });
  }

  /** List currently-active tournaments. Public. */
  active(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/active");
  }

  /** Fetch a single tournament. Requires `read`. */
  get(tournamentId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/tournaments/gettournament", undefined, {
      query: { tournament_id: tournamentId },
    });
  }

  /** Search across tournaments. Requires `read`. */
  search(query: string): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/search", undefined, {
      query: { q: query },
    });
  }

  /** Trades in a tournament. Requires `read`. */
  trades(
    tournamentId: number | string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/trades", undefined, {
      query: { tournament_id: tournamentId },
    });
  }

  /** Aggregated stats for a tournament. Requires `read`. */
  stats(tournamentId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/tournaments/stats", undefined, {
      query: { tournament_id: tournamentId },
    });
  }

  /** Activity feed for a tournament. Requires `read`. */
  activity(
    tournamentId: number | string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/activity", undefined, {
      query: { tournament_id: tournamentId },
    });
  }

  /** Overall cross-tournament leaderboard. Requires `read`. */
  leaderboard(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/tournaments/leaderboard", undefined, {
      query: params,
    });
  }

  /** Leaderboard for a specific tournament. Requires `read`. */
  tournamentLeaderboard(
    tournamentId: number | string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request(
      "GET",
      "/tournaments/leaderboard_tournament",
      undefined,
      { query: { tournament_id: tournamentId } },
    );
  }

  /** Join a tournament. Requires `manage`. */
  join(
    tournamentId: number | string,
    input: Record<string, unknown> = {},
  ): Promise<unknown> {
    return this.client.__request("POST", "/tournaments/join", {
      tournament_id: tournamentId,
      ...input,
    });
  }

  /** Leave a tournament. Requires `manage`. */
  leave(tournamentId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/tournaments/leave", {
      tournament_id: tournamentId,
    });
  }
}
