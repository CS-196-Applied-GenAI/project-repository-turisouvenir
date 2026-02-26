/**
 * Unit tests for user model (mocked database).
 */
jest.mock('../../src/config/database', () => ({ query: jest.fn() }));
const userModel = require('../../src/models/userModel');
const { query } = require('../../src/config/database');

describe('userModel', () => {
  beforeEach(() => query.mockReset());

  describe('findById', () => {
    it('returns user without password_hash when found', async () => {
      const row = { id: 1, username: 'u', email: 'u@ex.com', bio: null, profile_picture_url: null, created_at: new Date(), updated_at: new Date() };
      query.mockResolvedValueOnce([[row]]);
      const result = await userModel.findById(1);
      expect(result).toEqual(row);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [1]);
    });

    it('returns null when not found', async () => {
      query.mockResolvedValueOnce([[]]);
      const result = await userModel.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('returns user when found', async () => {
      const row = { id: 1, username: 'alice', email: 'alice@ex.com', password_hash: 'hash', bio: null, profile_picture_url: null, created_at: new Date(), updated_at: new Date() };
      query.mockResolvedValueOnce([[row]]);
      const result = await userModel.findByUsername('alice');
      expect(result).toEqual(row);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('username_lower'), ['alice']);
    });

    it('returns null when not found', async () => {
      query.mockResolvedValueOnce([[]]);
      const result = await userModel.findByUsername('nobody');
      expect(result).toBeNull();
    });
  });

  describe('isUsernameTaken', () => {
    it('returns true when taken', async () => {
      query.mockResolvedValueOnce([[{ 1: 1 }]]);
      const result = await userModel.isUsernameTaken('alice');
      expect(result).toBe(true);
    });

    it('returns false when not taken', async () => {
      query.mockResolvedValueOnce([[]]);
      const result = await userModel.isUsernameTaken('alice');
      expect(result).toBe(false);
    });

    it('excludes user id when provided', async () => {
      query.mockResolvedValueOnce([[]]);
      await userModel.isUsernameTaken('alice', 5);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('id !='), ['alice', 5]);
    });
  });

  describe('isEmailTaken', () => {
    it('returns true when taken', async () => {
      query.mockResolvedValueOnce([[{ 1: 1 }]]);
      const result = await userModel.isEmailTaken('a@b.com');
      expect(result).toBe(true);
    });
    it('returns false when not taken', async () => {
      query.mockResolvedValueOnce([[]]);
      const result = await userModel.isEmailTaken('a@b.com');
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('inserts and returns insertId', async () => {
      query.mockResolvedValueOnce([{ insertId: 42 }]);
      const id = await userModel.create({ username: 'alice', email: 'alice@ex.com', passwordHash: 'hash', bio: 'Hi' });
      expect(id).toBe(42);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT'), ['alice', 'alice@ex.com', 'hash', 'Hi']);
    });
  });

  describe('update', () => {
    it('updates only provided fields', async () => {
      query.mockResolvedValueOnce([undefined]);
      await userModel.update(1, { bio: 'New bio' });
      expect(query).toHaveBeenCalledWith(expect.stringContaining('bio = ?'), ['New bio', 1]);
    });

    it('updates username when provided', async () => {
      query.mockResolvedValueOnce([undefined]);
      await userModel.update(1, { username: 'newname' });
      expect(query).toHaveBeenCalledWith(expect.stringContaining('username = ?'), ['newname', 1]);
    });

    it('updates email when provided', async () => {
      query.mockResolvedValueOnce([undefined]);
      await userModel.update(1, { email: 'new@ex.com' });
      expect(query).toHaveBeenCalledWith(expect.stringContaining('email = ?'), ['new@ex.com', 1]);
    });

    it('updates profile_picture_url when provided', async () => {
      query.mockResolvedValueOnce([undefined]);
      await userModel.update(1, { profile_picture_url: 'https://example.com/pic.jpg' });
      expect(query).toHaveBeenCalledWith(expect.stringContaining('profile_picture_url'), ['https://example.com/pic.jpg', 1]);
    });

    it('does not call query when no fields provided', async () => {
      await userModel.update(1, {});
      expect(query).not.toHaveBeenCalled();
    });
  });
});
