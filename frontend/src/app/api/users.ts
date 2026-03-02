/**
 * Users API - profile, follow, block, tweets, followers, following
 */

import { apiFetch } from './client';
import type { Chirp } from './feed';

export interface UserProfile {
  id: number;
  username: string;
  email?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
  chirps_count: number;
  is_following?: boolean;
  is_blocked?: boolean;
  xp?: number;
  level?: number;
  streak?: number;
  badges?: string[];
}

export interface FollowResponse {
  is_following: boolean;
  followers_count: number;
}

export interface BlockResponse {
  is_blocked: boolean;
}

export async function getUserById(id: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${id}`);
}

export async function getUserByUsername(username: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/by-username/${encodeURIComponent(username)}`);
}

export async function updateMe(updates: { username?: string; bio?: string; email?: string }): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function uploadProfilePicture(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/me/profile-picture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('chirper_token')}`,
      },
      body: formData,
    }
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { error: (body as { error?: string }).error || response.statusText, status: response.status };
  }
  return response.json();
}

export async function getUserTweets(userId: string, limit = 20, offset = 0): Promise<Chirp[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await apiFetch<{ tweets: Chirp[] }>(`/users/${userId}/tweets?${params}`);
  return res.tweets;
}

export async function getFollowers(userId: string, limit = 50, offset = 0): Promise<UserProfile[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await apiFetch<{ users: UserProfile[] }>(`/users/${userId}/followers?${params}`);
  return res.users;
}

export async function getFollowing(userId: string, limit = 50, offset = 0): Promise<UserProfile[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await apiFetch<{ users: UserProfile[] }>(`/users/${userId}/following?${params}`);
  return res.users;
}

export async function getSuggestedUsers(limit = 10): Promise<UserProfile[]> {
  const res = await apiFetch<{ users: UserProfile[] }>(`/users/suggested?limit=${limit}`);
  return res.users;
}

export async function follow(userId: string): Promise<FollowResponse> {
  return apiFetch<FollowResponse>(`/users/${userId}/follow`, { method: 'POST' });
}

export async function unfollow(userId: string): Promise<FollowResponse> {
  return apiFetch<FollowResponse>(`/users/${userId}/follow`, { method: 'DELETE' });
}

export async function block(userId: string): Promise<BlockResponse> {
  return apiFetch<BlockResponse>(`/users/${userId}/block`, { method: 'POST' });
}

export async function unblock(userId: string): Promise<BlockResponse> {
  return apiFetch<BlockResponse>(`/users/${userId}/block`, { method: 'DELETE' });
}
