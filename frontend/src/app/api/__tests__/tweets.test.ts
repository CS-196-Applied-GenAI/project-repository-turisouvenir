import { createTweet, getTweetById, likeTweet, unlikeTweet, retweet, unretweet } from '../tweets';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('chirper_token', 'test-token');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('tweets API', () => {
  it('createTweet sends POST /tweets with content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 1, content: 'hello', author_id: 1, author: {}, created_at: '', likes_count: 0, retweets_count: 0, comments_count: 0, is_liked: false, is_retweeted: false }),
    });
    await createTweet('hello');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'hello' }),
      })
    );
  });

  it('getTweetById calls GET /tweets/:id', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1, content: 'x', author_id: 1, author: {}, created_at: '', likes_count: 0, retweets_count: 0, comments_count: 0, is_liked: false, is_retweeted: false }),
    });
    await getTweetById('1');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/tweets/1'), expect.any(Object));
  });

  it('likeTweet sends POST /tweets/:id/like', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });
    await likeTweet('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets/1/like'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('unlikeTweet sends DELETE /tweets/:id/like', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });
    await unlikeTweet('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets/1/like'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('retweet sends POST /tweets/:id/retweet', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 2, content: 'r', author_id: 1, author: {}, created_at: '', likes_count: 0, retweets_count: 0, comments_count: 0, is_liked: false, is_retweeted: true }),
    });
    await retweet('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets/1/retweet'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('unretweet sends DELETE /tweets/:id/retweet', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });
    await unretweet('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets/1/retweet'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
