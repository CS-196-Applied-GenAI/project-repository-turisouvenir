/**
 * Feed API - get feed with cursor pagination
 */

import { apiFetch } from './client';

export interface ChirpAuthor {
  id: number;
  username: string;
  profile_picture_url: string | null;
  level?: number;
}

export interface Chirp {
  id: number;
  author_id: number;
  author: ChirpAuthor;
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  comments_count: number;
  is_liked: boolean;
  is_retweeted: boolean;
  original_tweet_id?: number;
  original_tweet?: Chirp;
}

export interface FeedResponse {
  feed: Chirp[];
  nextCursor: string | null;
}

export async function getFeed(limit = 20, cursor?: string): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<FeedResponse>(`/feed?${params}`);
}
