/**
 * Tweets API - create, get, like, retweet
 */

import { apiFetch, apiFetchMultipart } from './client';
import type { Chirp } from './feed';

export interface CreateTweetOptions {
  content: string;
  image1?: File;
  image2?: File;
}

export async function createTweet(options: CreateTweetOptions | string): Promise<Chirp> {
  const content = typeof options === 'string' ? options : options.content;
  const image1 = typeof options === 'string' ? undefined : options.image1;
  const image2 = typeof options === 'string' ? undefined : options.image2;

  if (image1 || image2) {
    const form = new FormData();
    form.append('content', content);
    if (image1) form.append('image1', image1);
    if (image2) form.append('image2', image2);
    return apiFetchMultipart<Chirp>('/tweets', form);
  }

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
