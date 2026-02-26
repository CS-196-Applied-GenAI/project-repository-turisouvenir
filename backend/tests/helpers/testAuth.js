/**
 * Test helper: generate valid JWT for protected route tests.
 */
const jwt = require('jsonwebtoken');
const config = require('../../src/config');

function getToken(userId = 1, username = 'alice') {
  return jwt.sign(
    { userId, username },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { getToken, authHeader };
