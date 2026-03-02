/**
 * Tweets API - create, get, like, retweet
 */

import { apiFetch } from './client';
import type { Chirp } from './feed';

export async function createTweet(content: string): Promise<Chirp> {
  return apiFetch<Chirp>('/tweets', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getTweetById(id: string): Promise<Chirp> {
  return apiFetch<Chirp>(`/tweets/${id}`);
}

export async function likeTweet(id: string): Promise<void> {
  await apiFetch(`/tweets/${id}/like`, { method: 'POST' });
}

export async function unlikeTweet(id: string): Promise<void> {
  await apiFetch(`/tweets/${id}/like`, { method: 'DELETE' });
}

export async function retweet(id: string): Promise<Chirp> {
  return apiFetch<Chirp>(`/tweets/${id}/retweet`, { method: 'POST' });
}

export async function unretweet(id: string): Promise<void> {
  await apiFetch(`/tweets/${id}/retweet`, { method: 'DELETE' });
}
