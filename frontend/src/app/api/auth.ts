/**
 * Auth API - login, register, logout
 */

import { apiFetch, setToken } from './client';

export interface ApiUser {
  id: number;
  username: string;
  email: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
  expiresAt: number;
}

export interface RegisterResponse {
  token: string;
  user: ApiUser;
  expiresAt: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
  setToken(res.token);
  return res;
}

export async function register(
  username: string,
  email: string,
  password: string,
  bio?: string
): Promise<RegisterResponse> {
  const res = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, bio: bio || undefined }),
    skipAuth: true,
  });
  setToken(res.token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
}
