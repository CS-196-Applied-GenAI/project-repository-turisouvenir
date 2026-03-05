import { getUserById, getUserByUsername, updateMe, follow, unfollow, getFollowers, getFollowing, getSuggestedUsers } from '../users';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('chirper_token', 'test-token');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('users API', () => {
  it('getUserById calls GET /users/:id', async () => {
    const mockUser = { id: 1, username: 'u', created_at: '', followers_count: 0, following_count: 0, chirps_count: 0 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockUser) });
    const res = await getUserById('1');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/1'), expect.any(Object));
    expect(res).toEqual(mockUser);
  });

  it('getUserByUsername encodes username and calls GET /users/by-username/:username', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, username: 'test', created_at: '', followers_count: 0, following_count: 0, chirps_count: 0 }),
    });
    await getUserByUsername('test user');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/by-username/test%20user'),
      expect.any(Object)
    );
  });

  it('updateMe sends PUT /users/me with body', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, username: 'new', created_at: '', followers_count: 0, following_count: 0, chirps_count: 0 }),
    });
    await updateMe({ username: 'new' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ username: 'new' }),
      })
    );
  });

  it('follow sends POST /users/:id/follow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ is_following: true, followers_count: 1 }),
    });
    await follow('2');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/2/follow'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('unfollow sends DELETE /users/:id/follow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ is_following: false, followers_count: 0 }),
    });
    await unfollow('2');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/2/follow'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('getFollowers calls GET /users/:id/followers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ users: [] }),
    });
    await getFollowers('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/1\/followers\?/),
      expect.any(Object)
    );
  });

  it('getFollowing calls GET /users/:id/following', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ users: [] }),
    });
    await getFollowing('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/1\/following\?/),
      expect.any(Object)
    );
  });

  it('getSuggestedUsers calls GET /users/suggested', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ users: [] }),
    });
    await getSuggestedUsers(5);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/suggested?limit=5'),
      expect.any(Object)
    );
  });
});
