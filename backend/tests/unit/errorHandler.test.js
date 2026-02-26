/**
 * Unit tests for global error handler middleware.
 */
const { errorHandler } = require('../../src/middleware/errorHandler');

describe('errorHandler', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('sends err.statusCode and err.message', () => {
    const err = { statusCode: 400, message: 'Bad Request' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Bad Request' }));
  });

  it('defaults to 500 and "Internal Server Error" when statusCode/message missing', () => {
    errorHandler({}, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal Server Error' }));
  });

  it('includes stack in body when NODE_ENV is not production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const err = { statusCode: 500, message: 'Oops', stack: 'Error: Oops\n  at ...' };
    errorHandler(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ stack: err.stack }));
    process.env.NODE_ENV = originalEnv;
  });
});
