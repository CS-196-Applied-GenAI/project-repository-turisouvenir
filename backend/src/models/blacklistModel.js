/**
 * Blacklisted tokens model for logout.
 * Table: token (PK), expiration_time, created_at.
 */
const { query } = require('../config/database');

/**
 * Add a token to the blacklist (until expiry).
 * @param {string} token
 * @param {number} expirationTime - Unix timestamp
 */
async function add(token, expirationTime) {
  await query(
    'INSERT INTO blacklisted_tokens (token, expiration_time) VALUES (?, ?)',
    [token, expirationTime]
  );
}

/**
 * Check if token is blacklisted.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
async function has(token) {
  const [rows] = await query('SELECT 1 FROM blacklisted_tokens WHERE token = ?', [token]);
  return rows.length > 0;
}

module.exports = { add, has };
