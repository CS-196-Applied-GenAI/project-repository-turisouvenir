/**
 * Integration tests for users, follow, block endpoints.
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

describe('GET /users/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(401);
  });

  it('returns 200 and user when valid', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[{ id: 1, username: 'alice', bio: null, profile_picture_url: null, created_at: new Date(), updated_at: new Date() }]]);
    const res = await request(app)
      .get('/users/1')
      .set(authHeader(getToken()));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice');
  });

  it('returns 404 when user not found', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .get('/users/999')
      .set(authHeader(getToken()));
    expect(res.status).toBe(404);
  });
});

describe('PUT /users/me', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).put('/users/me').send({ bio: 'Hi' });
    expect(res.status).toBe(401);
  });

  it('returns 200 when updating bio', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([undefined]); // update
    mockQuery.mockResolvedValueOnce([[{ id: 1, username: 'alice', bio: 'Hi', profile_picture_url: null, created_at: new Date(), updated_at: new Date() }]]); // findById
    const res = await request(app)
      .put('/users/me')
      .set(authHeader(getToken()))
      .send({ bio: 'Hi' });
    expect(res.status).toBe(200);
  });

  it('returns 409 when username taken', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[{ 1: 1 }]]); // isUsernameTaken
    const res = await request(app)
      .put('/users/me')
      .set(authHeader(getToken()))
      .send({ username: 'bob' });
    expect(res.status).toBe(409);
  });
});

describe('POST /users/:id/follow', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).post('/users/2/follow');
    expect(res.status).toBe(401);
  });

  it('returns 400 when following self', async () => {
    mockRequireAuth();
    const res = await request(app)
      .post('/users/1/follow')
      .set(authHeader(getToken()));
    expect(res.status).toBe(400);
  });

  it('returns 201 when following', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([[]]); // isBlocked(1,2)
    mockQuery.mockResolvedValueOnce([[]]); // isBlocked(2,1)
    mockQuery.mockResolvedValueOnce([[]]); // followModel.exists
    mockQuery.mockResolvedValueOnce([undefined]); // followModel.add
    const res = await request(app)
      .post('/users/2/follow')
      .set(authHeader(getToken()));
    expect(res.status).toBe(201);
  });
});

describe('DELETE /users/:id/follow', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 204 when unfollowing', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // remove
    const res = await request(app)
      .delete('/users/2/follow')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});

describe('POST /users/:id/block', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 400 when blocking self', async () => {
    mockRequireAuth();
    const res = await request(app)
      .post('/users/1/block')
      .set(authHeader(getToken()));
    expect(res.status).toBe(400);
  });

  it('returns 200 when blocking', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([undefined]); // unfollowBoth
    mockQuery.mockResolvedValueOnce([[]]); // isBlocked
    mockQuery.mockResolvedValueOnce([undefined]); // add
    const res = await request(app)
      .post('/users/2/block')
      .set(authHeader(getToken()));
    expect(res.status).toBe(200);
  });
});

describe('DELETE /users/:id/block', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 204 when unblocking', async () => {
    mockRequireAuth();
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); // remove
    const res = await request(app)
      .delete('/users/2/block')
      .set(authHeader(getToken()));
    expect(res.status).toBe(204);
  });
});
