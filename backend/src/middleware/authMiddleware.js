/**
 * Auth middleware: extract JWT from Authorization header, verify, check blacklist, attach user.
 * Returns 401 if missing, invalid, or blacklisted.
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const blacklistModel = require('../models/blacklistModel');
const userModel = require('../models/userModel');

/**
 * Require valid JWT. Expects Authorization: Bearer <token>.
 * On success: req.user = { id, username }; req.token = raw token string.
 * On failure: responds with 401 and does not call next().
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const isBlacklisted = await blacklistModel.has(token);
  if (isBlacklisted) {
    return res.status(401).json({ error: 'Token has been invalidated (logged out)' });
  }
  const user = await userModel.findById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = { id: user.id, username: user.username };
  req.token = token;
  next();
}

module.exports = { requireAuth };
