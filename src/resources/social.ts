import type { CryptohopperClient } from "../client.js";

/**
 * `client.social` — social graph + feed + posts + conversations.
 *
 * Largest resource in the SDK (27 endpoints). Read methods are prefixed
 * with `get` where a write counterpart exists (`getPost` vs `createPost`,
 * `getComment` vs `deleteComment`); bare verbs (`like`, `follow`,
 * `repost`, `sendMessage`) where no collision.
 */
export class Social {
  constructor(private readonly client: CryptohopperClient) {}

  // ─── Profiles ────────────────────────────────────────────────────────

  /** Fetch a public profile by alias or id. Requires `read`. */
  getProfile(
    aliasOrId: string | number,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/getprofile", undefined, {
      query: { alias: aliasOrId },
    });
  }

  /** Update the authenticated user's own profile. Requires `user`. */
  editProfile(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/social/editprofile", input);
  }

  /** Check whether an alias (display handle) is available. */
  checkAlias(alias: string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/checkalias", undefined, {
      query: { alias },
    });
  }

  // ─── Feed / trends / discovery ───────────────────────────────────────

  /** The authenticated user's personalised feed. Requires `read`. */
  getFeed(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/getfeed", undefined, {
      query: params,
    });
  }

  /** Trending topics. Requires `read`. */
  getTrends(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/gettrends");
  }

  /** Suggested profiles to follow. Requires `read`. */
  whoToFollow(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/whotofollow");
  }

  /** Search for posts / users. Requires `read`. */
  search(query: string): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/search", undefined, {
      query: { q: query },
    });
  }

  // ─── Notifications ───────────────────────────────────────────────────

  /** Notifications for the authenticated user. Requires `notifications`. */
  getNotifications(
    params?: Record<string, string | number | undefined>,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/getnotifications", undefined, {
      query: params,
    });
  }

  // ─── Conversations / messages ────────────────────────────────────────

  /** List the user's DM conversations. Requires `read`. */
  getConversationList(): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/getconversationlist");
  }

  /** Load messages for a single conversation. Requires `read`. */
  getConversation(
    conversationId: number | string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/loadconversation", undefined, {
      query: { conversation_id: conversationId },
    });
  }

  /** Send a DM. Requires `user`. */
  sendMessage(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/social/sendmessage", input);
  }

  /** Delete a DM. Requires `user`. */
  deleteMessage(messageId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/deletemessage", {
      message_id: messageId,
    });
  }

  // ─── Posts ───────────────────────────────────────────────────────────

  /** Create a new post. Requires `user`. */
  createPost(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client.__request("POST", "/social/post", input);
  }

  /** Fetch a single post. Requires `read`. */
  getPost(postId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/getpost", undefined, {
      query: { post_id: postId },
    });
  }

  /** Delete a post. Requires `user`. */
  deletePost(postId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/deletepost", { post_id: postId });
  }

  /** Pin/unpin a post on the user's profile. Requires `user`. */
  pinPost(postId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/pinpost", { post_id: postId });
  }

  // ─── Comments ────────────────────────────────────────────────────────

  /** Fetch a single comment. Requires `read`. */
  getComment(commentId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/getcomment", undefined, {
      query: { comment_id: commentId },
    });
  }

  /** List comments on a post. Requires `read`. */
  getComments(
    postId: number | string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/getcomments", undefined, {
      query: { post_id: postId },
    });
  }

  /** Delete a comment. Requires `user`. */
  deleteComment(commentId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/deletecomment", {
      comment_id: commentId,
    });
  }

  // ─── Media ───────────────────────────────────────────────────────────

  /** Fetch a media attachment. Requires `read`. */
  getMedia(mediaId: number | string): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/getmedia", undefined, {
      query: { media_id: mediaId },
    });
  }

  // ─── Social graph ────────────────────────────────────────────────────

  /** Follow or unfollow an alias. Requires `user`. */
  follow(aliasOrId: string | number): Promise<unknown> {
    return this.client.__request("POST", "/social/follow", { alias: aliasOrId });
  }

  /** List followers of a profile. Requires `read`. */
  getFollowers(
    aliasOrId: string | number,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/followers", undefined, {
      query: { alias: aliasOrId },
    });
  }

  /** Check whether the authenticated user follows the given profile. Requires `read`. */
  getFollowing(
    aliasOrId: string | number,
  ): Promise<Record<string, unknown>> {
    return this.client.__request("GET", "/social/following", undefined, {
      query: { alias: aliasOrId },
    });
  }

  /** List profiles the given user follows. Requires `read`. */
  getFollowingProfiles(
    aliasOrId: string | number,
  ): Promise<Array<Record<string, unknown>>> {
    return this.client.__request("GET", "/social/followingprofiles", undefined, {
      query: { alias: aliasOrId },
    });
  }

  // ─── Engagement ──────────────────────────────────────────────────────

  /** Like/unlike a post. Requires `user`. */
  like(postId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/like", { post_id: postId });
  }

  /** Repost a post. Requires `user`. */
  repost(postId: number | string): Promise<unknown> {
    return this.client.__request("POST", "/social/repost", { post_id: postId });
  }

  // ─── Moderation ──────────────────────────────────────────────────────

  /** Block a user. Requires `user`. */
  blockUser(aliasOrId: string | number): Promise<unknown> {
    return this.client.__request("POST", "/social/blockuser", {
      alias: aliasOrId,
    });
  }
}
