/**
 * Unit tests for database module (mocked MySQL).
 */
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    execute: jest.fn().mockResolvedValue([[], []]),
    end: jest.fn().mockResolvedValue(undefined),
  })),
}));

const { getPool, query, closePool } = require('../../src/config/database');
const mysql = require('mysql2/promise');

describe('database', () => {
  afterEach(async () => {
    await closePool();
  });

  it('getPool creates pool on first call', async () => {
    const p = await getPool();
    expect(p).toBeDefined();
    expect(p.execute).toBeDefined();
    expect(mysql.createPool).toHaveBeenCalledWith(expect.objectContaining({
      host: expect.any(String),
      database: expect.any(String),
    }));
  });

  it('getPool returns same pool on second call', async () => {
    const p1 = await getPool();
    const p2 = await getPool();
    expect(p1).toBe(p2);
  });

  it('query calls pool.execute with sql and params', async () => {
    const [rows] = await query('SELECT 1', []);
    expect(mysql.createPool).toHaveBeenCalled();
    const p = await getPool();
    expect(p.execute).toHaveBeenCalledWith('SELECT 1', []);
  });

  it('closePool ends pool and resets so next getPool creates new pool', async () => {
    await getPool();
    await closePool();
    const p = await getPool();
    expect(p).toBeDefined();
    expect(p.execute).toBeDefined();
  });
});
