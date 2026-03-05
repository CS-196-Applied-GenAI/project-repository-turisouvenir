import { apiFetch, getToken, setToken, apiFetchMultipart } from '../client';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.clear();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('getToken / setToken', () => {
  it('returns null when no token', () => {
    expect(getToken()).toBeNull();
  });

  it('stores and returns token', () => {
    setToken('abc123');
    expect(getToken()).toBe('abc123');
  });

  it('removes token when set to null', () => {
    setToken('abc');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe('apiFetch', () => {
  it('includes Authorization when token exists', async () => {
    setToken('secret');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 1 }),
    });
    await apiFetch('/test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer secret' }),
      })
    );
  });

  it('skips Authorization when skipAuth is true', async () => {
    setToken('secret');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    await apiFetch('/auth/login', { method: 'POST', body: '{}', skipAuth: true });
    const call = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(call.headers).not.toHaveProperty('Authorization');
  });

  it('returns JSON on 200', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ foo: 'bar' }),
    });
    const result = await apiFetch<{ foo: string }>('/test');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns undefined on 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });
    const result = await apiFetch('/test');
    expect(result).toBeUndefined();
  });

  it('throws on non-ok with error message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    });
    await expect(apiFetch('/test')).rejects.toEqual(
      expect.objectContaining({ error: 'Invalid credentials', status: 401 })
    );
  });

  it('throws on non-ok when JSON parse fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.reject(new Error('bad json')),
    });
    await expect(apiFetch('/test')).rejects.toMatchObject({ status: 500 });
  });
});

describe('apiFetchMultipart', () => {
  it('sends FormData and Authorization', async () => {
    setToken('t');
    const form = new FormData();
    form.append('file', new Blob(['x']), 'a.txt');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: '/img.png' }),
    });
    await apiFetchMultipart('/upload', form);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer t' },
        body: form,
      })
    );
  });
});
