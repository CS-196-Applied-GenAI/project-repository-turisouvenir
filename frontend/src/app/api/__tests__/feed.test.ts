import { getFeed } from '../feed';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('chirper_token', 'test-token');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('getFeed', () => {
  it('calls GET /feed with limit param', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ feed: [], nextCursor: null }),
    });
    await getFeed(20);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/feed?limit=20'),
      expect.any(Object)
    );
  });

  it('includes cursor when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ feed: [], nextCursor: null }),
    });
    await getFeed(10, 'abc');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/cursor=abc/),
      expect.any(Object)
    );
  });

  it('returns feed and nextCursor', async () => {
    const mockFeed = [{ id: 1, author_id: 1, author: { id: 1, username: 'u' }, content: 'hi', created_at: '', likes_count: 0, retweets_count: 0, comments_count: 0, is_liked: false, is_retweeted: false }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ feed: mockFeed, nextCursor: 'next' }),
    });
    const res = await getFeed(20);
    expect(res.feed).toEqual(mockFeed);
    expect(res.nextCursor).toBe('next');
  });
});
