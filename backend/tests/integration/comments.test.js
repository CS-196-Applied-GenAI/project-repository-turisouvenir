/**
 * Integration tests for comments endpoints.
 */
const request = require('supertest');
const { getToken, authHeader } = require('../helpers/testAuth');

const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  query: (...args) => mockQuery(...args),
  getPool: jest.fn(),
  closePool: jest.fn(),
}));

const app = require('../../src/app');

function mockRequireAuth() {
  mockQuery.mockResolvedValueOnce([[]]); // blacklistModel.has
  mockQuery.mockResolvedValueOnce([[{ id: 1, username: 'alice' }]]); // userModel.findById
}

const tweetRow = { id: 1, author_id: 1, content: 'Hello', original_tweet_id: null, is_deleted: false, created_at: new Date(), updated_at: new Date() };

describe('POST /tweets/:id/comments', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).post('/tweets/1/comments').send({ content: 'Nice!' });
    expect(res.status).toBe(401);
  });

  it('returns 201 and comment when valid', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow]]); // findById tweet
    mockQuery.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]); // isBlocked x2
    mockQuery.mockResolvedValueOnce([{ insertId: 1 }]); // create
    mockQuery.mockResolvedValueOnce([[{ id: 1, user_id: 1, tweet_id: 1, content: 'Nice!', username: 'alice', created_at: new Date() }]]); // findById comment
    const res = await request(app)
      .post('/tweets/1/comments')
      .set(authHeader(getToken()))
      .send({ content: 'Nice!' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Nice!');
  });

  it('returns 400 for invalid content', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow]]);
    mockQuery.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post('/tweets/1/comments')
      .set(authHeader(getToken()))
      .send({ content: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tweets/:id/comments', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 200 and comments', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow]]); // findById tweet
    mockQuery.mockResolvedValueOnce([[]]); // getBlockedSet
    mockQuery.mockResolvedValueOnce([[{ id: 1, content: 'Hi', username: 'alice' }]]); // getByTweetId
    const res = await request(app)
      .get('/tweets/1/comments')
      .set(authHeader(getToken()));
    expect(res.status).toBe(200);
    expect(res.body.comments).toBeDefined();
  });
});

describe('DELETE /comments/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 403 when not author', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[{ id: 1, user_id: 2, tweet_id: 1, content: 'Hi', username: 'bob' }]]); // findById - user_id 2
    const res = await request(app)
      .delete('/comments/1')
      .set(authHeader(getToken()));
    expect(res.status).toBe(403);
  });

  it('returns 204 when deleting own comment', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[{ id: 1, user_id: 1, tweet_id: 1, content: 'Hi', username: 'alice' }]]); // findById
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // deleteById
    const res = await request(app)
      .delete('/comments/1')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});
