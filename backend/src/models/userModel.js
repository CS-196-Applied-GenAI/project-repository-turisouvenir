/**
 * User model: DB access for users table.
 * Table: id, username, username_lower (generated), password_hash, bio, profile_picture_url, created_at, updated_at.
 */
const { query } = require('../config/database');

/**
 * Find user by id. Returns row or null.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await query('SELECT id, username, bio, profile_picture_url, created_at, updated_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Find user by username (case-insensitive, using username_lower).
 * @param {string} username
 * @returns {Promise<object|null>} Full row including password_hash (for login).
 */
async function findByUsername(username) {
  const lower = username.trim().toLowerCase();
  const [rows] = await query(
    'SELECT id, username, password_hash, bio, profile_picture_url, created_at, updated_at FROM users WHERE username_lower = ?',
    [lower]
  );
  return rows[0] || null;
}

/**
 * Check if username is taken (case-insensitive).
 * @param {string} username
 * @param {number} [excludeUserId] - Optional user id to exclude (for update-me).
 * @returns {Promise<boolean>}
 */
async function isUsernameTaken(username, excludeUserId = null) {
  const lower = username.trim().toLowerCase();
  let sql = 'SELECT 1 FROM users WHERE username_lower = ?';
  const params = [lower];
  if (excludeUserId != null) {
    sql += ' AND id != ?';
    params.push(excludeUserId);
  }
  const [rows] = await query(sql, params);
  return rows.length > 0;
}

/**
 * Insert a new user. Returns the inserted id.
 * @param {{ username: string, passwordHash: string, bio?: string }}
 * @returns {Promise<number>}
 */
async function create({ username, passwordHash, bio = null }) {
  const [result] = await query(
    'INSERT INTO users (username, password_hash, bio) VALUES (?, ?, ?)',
    [username.trim(), passwordHash, bio]
  );
  return result.insertId;
}

/**
 * Update user by id. Only updates provided fields (bio, username, profile_picture_url).
 * @param {number} id
 * @param {{ bio?: string, username?: string, profile_picture_url?: string }}
 */
async function update(id, { bio, username, profile_picture_url }) {
  const updates = [];
  const params = [];
  if (bio !== undefined) {
    updates.push('bio = ?');
    params.push(bio);
  }
  if (username !== undefined) {
    updates.push('username = ?');
    params.push(username.trim());
  }
  if (profile_picture_url !== undefined) {
    updates.push('profile_picture_url = ?');
    params.push(profile_picture_url);
  }
  if (updates.length === 0) return;
  params.push(id);
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
}

module.exports = {
  findById,
  findByUsername,
  isUsernameTaken,
  create,
  update,
};
