/**
 * Integration tests for tweets, likes, retweets, feed endpoints.
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

const tweetRow = (id, authorId = 1, content = 'Hello world', originalId = null) => ({
  id,
  author_id: authorId,
  content,
  original_tweet_id: originalId,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
});

describe('POST /tweets', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).post('/tweets').send({ content: 'Hello world today' });
    expect(res.status).toBe(401);
  });

  it('returns 201 and tweet when valid', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([{ insertId: 1 }]); // create
    mockQuery.mockResolvedValueOnce([[tweetRow(1, 1, 'Hello world today')]]); // findById - match created content
    const res = await request(app)
      .post('/tweets')
      .set(authHeader(getToken()))
      .send({ content: 'Hello world today' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hello world today');
  });

  it('returns 400 for invalid content', async () => {
    mockRequireAuth();
    const res = await request(app)
      .post('/tweets')
      .set(authHeader(getToken()))
      .send({ content: 'ab' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /tweets/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 403 when not author', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(1, 2)]]); // findById - author is 2
    const res = await request(app)
      .put('/tweets/1')
      .set(authHeader(getToken()))
      .send({ content: 'Updated content here' });
    expect(res.status).toBe(403);
  });

  it('returns 200 when updating own tweet', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(1)]]); // findById
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // update
    mockQuery.mockResolvedValueOnce([[tweetRow(1, 1, 'Updated content here')]]); // findById
    const res = await request(app)
      .put('/tweets/1')
      .set(authHeader(getToken()))
      .send({ content: 'Updated content here' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /tweets/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 204 when deleting own tweet', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(1)]]); // findById
    mockQuery.mockResolvedValueOnce([undefined]); // delete likes
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // softDelete
    const res = await request(app)
      .delete('/tweets/1')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});

describe('POST /tweets/:id/like', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 201 when liking', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(1)]]); // findById
    mockQuery.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]); // isBlocked x2
    mockQuery.mockResolvedValueOnce([[]]); // likeModel.exists
    mockQuery.mockResolvedValueOnce([undefined]); // likeModel.add
    const res = await request(app)
      .post('/tweets/1/like')
      .set(authHeader(getToken()));
    expect(res.status).toBe(201);
  });
});

describe('DELETE /tweets/:id/like', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 204 when unliking', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // remove
    const res = await request(app)
      .delete('/tweets/1/like')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});

describe('POST /tweets/:id/retweet', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 201 when retweeting', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(1)]]); // findById original
    mockQuery.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]); // isBlocked x2
    mockQuery.mockResolvedValueOnce([[]]); // hasRetweeted
    mockQuery.mockResolvedValueOnce([{ insertId: 2 }]); // create retweet
    mockQuery.mockResolvedValueOnce([[tweetRow(2, 1, '', 1)]]); // findById retweet
    const res = await request(app)
      .post('/tweets/1/retweet')
      .set(authHeader(getToken()));
    expect(res.status).toBe(201);
    expect(res.body.original_tweet_id).toBe(1);
  });
});

describe('DELETE /tweets/:id/retweet', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 204 when unretweeting', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[tweetRow(2, 1, '', 1)]]); // findById retweet
    mockQuery.mockResolvedValueOnce([undefined]); // delete likes
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // softDelete
    const res = await request(app)
      .delete('/tweets/2/retweet')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});

describe('GET /feed', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/feed');
    expect(res.status).toBe(401);
  });

  it('returns 200 and feed', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[]]); // getBlockedSet (empty)
    mockQuery.mockResolvedValueOnce([[tweetRow(1)]]); // feed query
    const res = await request(app)
      .get('/feed')
      .set(authHeader(getToken()));
    expect(res.status).toBe(200);
    expect(res.body.feed).toBeDefined();
    expect(Array.isArray(res.body.feed)).toBe(true);
  });
});
