/**
 * Comments API - get, add comments
 */

import { apiFetch } from './client';

export interface Comment {
  id: number;
  author_id: number;
  author: {
    id: number;
    username: string;
    profile_picture_url: string | null;
    level?: number;
  };
  content: string;
  created_at: string;
  tweet_id: number;
}

export interface CommentsResponse {
  comments: Comment[];
}

export async function getComments(tweetId: string, limit = 50, offset = 0): Promise<Comment[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await apiFetch<CommentsResponse>(`/tweets/${tweetId}/comments?${params}`);
  return res.comments;
}

export async function addComment(tweetId: string, content: string): Promise<Comment> {
  return apiFetch<Comment>(`/tweets/${tweetId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
