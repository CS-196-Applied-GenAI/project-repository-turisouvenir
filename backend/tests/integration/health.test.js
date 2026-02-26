/**
 * Integration tests: health and 404.
 */
const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('returns 200 and { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('404', () => {
  it('returns 404 and error message for unknown path', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});
