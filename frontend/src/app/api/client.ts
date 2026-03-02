/**
 * API client for Chirper backend.
 * Base URL: VITE_API_URL or http://localhost:3000
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('chirper_token');
}

function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('chirper_token', token);
  } else {
    localStorage.removeItem('chirper_token');
  }
}

export interface ApiError {
  error: string;
  status?: number;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init.headers as object) },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const err: ApiError = {
      error: (body as { error?: string }).error || response.statusText || 'Request failed',
      status: response.status,
    };
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiFetchMultipart<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { error: (body as { error?: string }).error || response.statusText, status: response.status };
  }

  return response.json();
}

export { getToken, setToken };
