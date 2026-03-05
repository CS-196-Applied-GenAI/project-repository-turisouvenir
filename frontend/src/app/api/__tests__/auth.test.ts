import { login, register, logout } from '../auth';
import { getToken, setToken } from '../client';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.clear();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('login', () => {
  it('calls POST /auth/login and stores token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          token: 'jwt123',
          user: { id: 1, username: 'u', email: 'u@x.com', bio: null, profile_picture_url: null, created_at: '', updated_at: '' },
          expiresAt: 12345,
        }),
    });
    const res = await login('u', 'pass');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'u', password: 'pass' }),
      })
    );
    expect(res.token).toBe('jwt123');
    expect(getToken()).toBe('jwt123');
  });
});

describe('register', () => {
  it('calls POST /auth/register and stores token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          token: 'newjwt',
          user: { id: 2, username: 'new', email: 'new@x.com', bio: 'hi', profile_picture_url: null, created_at: '', updated_at: '' },
          expiresAt: 99999,
        }),
    });
    const res = await register('new', 'new@x.com', 'secret', 'hi');
    expect(res.user.username).toBe('new');
    expect(getToken()).toBe('newjwt');
  });
});

describe('logout', () => {
  it('calls POST /auth/logout and clears token', async () => {
    setToken('old');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: 'Logged out' }),
    });
    await logout();
    expect(getToken()).toBeNull();
  });

  it('clears token even when API fails', async () => {
    setToken('old');
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'));
    await logout().catch(() => {});
    expect(getToken()).toBeNull();
  });
});
