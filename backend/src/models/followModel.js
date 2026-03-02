/**
 * Follow model: DB access for follows table.
 */
const { query } = require('../config/database');

async function add(followerId, followingId) {
  await query(
    'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
    [followerId, followingId]
  );
}

async function remove(followerId, followingId) {
  const [result] = await query(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
  return result.affectedRows > 0;
}

async function exists(followerId, followingId) {
  const [rows] = await query(
    'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
  return rows.length > 0;
}

/** Get list of user ids that the user follows. */
async function getFollowingIds(userId) {
  const [rows] = await query(
    'SELECT following_id FROM follows WHERE follower_id = ?',
    [userId]
  );
  return rows.map((r) => r.following_id);
}

/** Get list of user ids that follow this user. */
async function getFollowerIds(userId) {
  const [rows] = await query(
    'SELECT follower_id FROM follows WHERE following_id = ?',
    [userId]
  );
  return rows.map((r) => r.follower_id);
}

module.exports = { add, remove, exists, getFollowingIds, getFollowerIds };
