/**
 * Comment model: DB access for comments table.
 */
const { query } = require('../config/database');

async function create({ user_id, tweet_id, content }) {
  const [result] = await query(
    'INSERT INTO comments (user_id, tweet_id, content) VALUES (?, ?, ?)',
    [user_id, tweet_id, content.trim()]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await query(
    'SELECT c.*, u.username, u.profile_picture_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?',
    [id]
  );
  return rows[0] || null;
}

async function deleteById(id) {
  const [result] = await query('DELETE FROM comments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Get comments for a tweet (paginated). Exclude comments from blocked users (blocker or blocked).
 * @param {number} tweetId
 * @param {Set<number>} blockedUserIds - set of user ids to exclude (either direction)
 * @param {number} limit
 * @param {number} offset
 */
async function getByTweetId(tweetId, blockedUserIds, limit = 50, offset = 0) {
  const lim = Math.min(Math.max(0, parseInt(limit, 10) || 50), 100);
  const off = Math.max(0, parseInt(offset, 10) || 0);
  if (blockedUserIds.size > 0) {
    const [rows] = await query(
      `SELECT c.*, u.username, u.profile_picture_url
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.tweet_id = ? AND c.user_id NOT IN (?)
       ORDER BY c.created_at ASC LIMIT ${lim} OFFSET ${off}`,
      [tweetId, [...blockedUserIds]]
    );
    return rows;
  }
  const [rows] = await query(
    `SELECT c.*, u.username, u.profile_picture_url
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.tweet_id = ? ORDER BY c.created_at ASC LIMIT ${lim} OFFSET ${off}`,
    [tweetId]
  );
  return rows;
}

module.exports = { create, findById, deleteById, getByTweetId };
