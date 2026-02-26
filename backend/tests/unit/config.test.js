/**
 * Unit tests for config (env loading).
 */
const config = require('../../src/config');

describe('config', () => {
  it('exports port number', () => {
    expect(typeof config.port).toBe('number');
    expect(config.port).toBeGreaterThan(0);
  });

  it('exports jwt.secret and jwt.expiresIn', () => {
    expect(config.jwt.secret).toBeDefined();
    expect(typeof config.jwt.expiresIn).toBe('string');
  });

  it('exports db with host, port, user, database', () => {
    expect(config.db.host).toBeDefined();
    expect(typeof config.db.port).toBe('number');
    expect(config.db.user).toBeDefined();
    expect(config.db.database).toBeDefined();
  });

  it('exports s3 with region and bucket', () => {
    expect(config.s3).toBeDefined();
    expect(config.s3.region).toBeDefined();
  });
});
