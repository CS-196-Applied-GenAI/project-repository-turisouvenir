/**
 * Tweet model: DB access for tweets table.
 * Handles create, update, soft delete, fetch by id, and feed building.
 */
const { query } = require('../config/database');

/**
 * Create a tweet. Returns insertId.
 * @param {{ author_id: number, content: string, original_tweet_id?: number }}
 */
async function create({ author_id, content, original_tweet_id = null }) {
  const [result] = await query(
    'INSERT INTO tweets (author_id, content, original_tweet_id) VALUES (?, ?, ?)',
    [author_id, content.trim(), original_tweet_id]
  );
  return result.insertId;
}

/**
 * Find tweet by id. Returns row or null (excludes soft-deleted by default).
 */
async function findById(id, includeDeleted = false) {
  let sql = 'SELECT * FROM tweets WHERE id = ?';
  if (!includeDeleted) sql += ' AND is_deleted = FALSE';
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

/**
 * Update tweet content. Only author can edit; cannot edit if deleted.
 */
async function update(id, content) {
  const [result] = await query(
    'UPDATE tweets SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = FALSE',
    [content.trim(), id]
  );
  return result.affectedRows > 0;
}

/**
 * Soft delete: set is_deleted = true. Delete all likes for this tweet (per spec).
 */
async function softDelete(id) {
  await query('DELETE FROM likes WHERE tweet_id = ?', [id]);
  const [result] = await query('UPDATE tweets SET is_deleted = TRUE WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Check if user has already retweeted this original tweet.
 */
async function hasRetweeted(authorId, originalTweetId) {
  const [rows] = await query(
    'SELECT 1 FROM tweets WHERE author_id = ? AND original_tweet_id = ? AND is_deleted = FALSE',
    [authorId, originalTweetId]
  );
  return rows.length > 0;
}

module.exports = {
  create,
  findById,
  update,
  softDelete,
  hasRetweeted,
};
