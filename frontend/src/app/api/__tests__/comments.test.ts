import { getComments, addComment } from '../comments';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('chirper_token', 'test-token');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('comments API', () => {
  it('getComments calls GET /tweets/:id/comments and returns comments', async () => {
    const mockComments = [{ id: 1, author_id: 1, author: { id: 1, username: 'u', profile_picture_url: null }, content: 'c', created_at: '', tweet_id: 1 }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ comments: mockComments }),
    });
    const res = await getComments('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tweets\/1\/comments\?.*limit=50.*offset=0/),
      expect.any(Object)
    );
    expect(res).toEqual(mockComments);
  });

  it('addComment sends POST /tweets/:id/comments with content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 1, author_id: 1, author: {}, content: 'new', created_at: '', tweet_id: 1 }),
    });
    await addComment('1', 'new');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tweets/1/comments'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'new' }),
      })
    );
  });
});
