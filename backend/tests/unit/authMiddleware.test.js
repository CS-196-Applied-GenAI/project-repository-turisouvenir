/**
 * Unit tests for requireAuth middleware.
 */
const jwt = require('jsonwebtoken');
const config = require('../../src/config');

const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({ query: (...args) => mockQuery(...args), getPool: jest.fn(), closePool: jest.fn() }));
jest.mock('../../src/models/blacklistModel', () => ({ has: jest.fn() }));
jest.mock('../../src/models/userModel', () => ({ findById: jest.fn() }));

const { requireAuth } = require('../../src/middleware/authMiddleware');
const blacklistModel = require('../../src/models/blacklistModel');
const userModel = require('../../src/models/userModel');

describe('requireAuth', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    blacklistModel.has.mockReset();
    userModel.findById.mockReset();
  });

  it('returns 401 when Authorization header missing', async () => {
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Bearer prefix missing', async () => {
    req.headers.authorization = 'token';
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token blacklisted', async () => {
    const token = jwt.sign({ userId: 1 }, config.jwt.secret, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    blacklistModel.has.mockResolvedValue(true);
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when user not found', async () => {
    const token = jwt.sign({ userId: 999 }, config.jwt.secret, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    blacklistModel.has.mockResolvedValue(false);
    userModel.findById.mockResolvedValue(null);
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches user and calls next when valid', async () => {
    const token = jwt.sign({ userId: 1 }, config.jwt.secret, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;
    blacklistModel.has.mockResolvedValue(false);
    userModel.findById.mockResolvedValue({ id: 1, username: 'alice' });
    await requireAuth(req, res, next);
    expect(req.user).toEqual({ id: 1, username: 'alice' });
    expect(req.token).toBe(token);
    expect(next).toHaveBeenCalled();
  });
});
