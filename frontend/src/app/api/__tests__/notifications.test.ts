import { getNotifications } from '../notifications';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('chirper_token', 'test-token');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('getNotifications', () => {
  it('calls GET /notifications and returns notifications array', async () => {
    const mockNotifs = [
      { id: '1', type: 'like' as const, user: { username: 'u', profile_picture_url: '', level: 1 }, timestamp: '' },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ notifications: mockNotifs }),
    });
    const res = await getNotifications();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications'),
      expect.any(Object)
    );
    expect(res).toEqual(mockNotifs);
  });

  it('returns empty array when response has no notifications', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    const res = await getNotifications();
    expect(res).toEqual([]);
  });
});
