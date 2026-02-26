/**
 * Integration tests for auth (register, login, logout).
 * Mocks the database so no real MySQL is required.
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  query: (...args) => mockQuery(...args),
  getPool: jest.fn(),
  closePool: jest.fn(),
}));

const app = require('../../src/app');

describe('POST /auth/register', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 201 and user (no password) when valid', async () => {
    mockQuery
      .mockResolvedValueOnce([[]]) // isUsernameTaken
      .mockResolvedValueOnce([{ insertId: 1 }]) // create
      .mockResolvedValueOnce([[{ id: 1, username: 'alice', bio: null, profile_picture_url: null, created_at: new Date(), updated_at: new Date() }]]); // findById
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'Password1' });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 409 when username taken', async () => {
    mockQuery.mockResolvedValueOnce([[{ 1: 1 }]]); // isUsernameTaken -> taken
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'Password1' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already taken/i);
  });

  it('returns 400 for invalid username', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'ab', password: 'Password1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 500 when DB throws', async () => {
    mockQuery.mockResolvedValueOnce([[]]).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', password: 'Password1' });
    expect(res.status).toBe(500);
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 200 and token when valid', async () => {
    const hash = await bcrypt.hash('Password1', 10);
    mockQuery.mockResolvedValueOnce([[{
      id: 1,
      username: 'alice',
      password_hash: hash,
      bio: null,
      profile_picture_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    }]]);
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'alice', password: 'Password1' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    const decoded = jwt.decode(res.body.token);
    expect(decoded.userId).toBe(1);
  });

  it('returns 401 when user not found', async () => {
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'nobody', password: 'Password1' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when password wrong', async () => {
    const hash = await bcrypt.hash('OtherPass1', 10);
    mockQuery.mockResolvedValueOnce([[{
      id: 1,
      username: 'alice',
      password_hash: hash,
      bio: null,
      profile_picture_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    }]]);
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'alice', password: 'Password1' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  beforeEach(() => mockQuery.mockReset());

  it('returns 401 without token', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(401);
  });

  it('returns 200 and blacklists token when valid', async () => {
    const token = jwt.sign(
      { userId: 1, username: 'alice' },
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
      { expiresIn: '7d' }
    );
    mockQuery.mockResolvedValueOnce([[]]); // blacklistModel.has
    mockQuery.mockResolvedValueOnce([[{ id: 1, username: 'alice' }]]); // userModel.findById
    mockQuery.mockResolvedValueOnce([undefined]); // blacklistModel.add
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
