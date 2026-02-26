/**
 * Like model: DB access for likes table.
 */
const { query } = require('../config/database');

async function add(userId, tweetId) {
  await query('INSERT INTO likes (user_id, tweet_id) VALUES (?, ?)', [userId, tweetId]);
}

async function remove(userId, tweetId) {
  const [result] = await query('DELETE FROM likes WHERE user_id = ? AND tweet_id = ?', [userId, tweetId]);
  return result.affectedRows > 0;
}

async function exists(userId, tweetId) {
  const [rows] = await query('SELECT 1 FROM likes WHERE user_id = ? AND tweet_id = ?', [userId, tweetId]);
  return rows.length > 0;
}

module.exports = { add, remove, exists };
