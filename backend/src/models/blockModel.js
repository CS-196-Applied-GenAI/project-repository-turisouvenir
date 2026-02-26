/**
 * Block model: DB access for blocks table.
 */
const { query } = require('../config/database');

async function add(blockerId, blockedId) {
  await query(
    'INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)',
    [blockerId, blockedId]
  );
}

async function remove(blockerId, blockedId) {
  const [result] = await query(
    'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
    [blockerId, blockedId]
  );
  return result.affectedRows > 0;
}

async function isBlocked(blockerId, blockedId) {
  const [rows] = await query(
    'SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
    [blockerId, blockedId]
  );
  return rows.length > 0;
}

/** Get set of user ids that have a block relationship with userId (either direction). */
async function getBlockedSet(userId) {
  const [rows] = await query(
    'SELECT blocked_id AS id FROM blocks WHERE blocker_id = ? UNION SELECT blocker_id AS id FROM blocks WHERE blocked_id = ?',
    [userId, userId]
  );
  return new Set(rows.map((r) => r.id));
}

/** When A blocks B: remove follow in both directions. */
async function unfollowBoth(blockerId, blockedId) {
  await query('DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)',
    [blockerId, blockedId, blockedId, blockerId]);
}

module.exports = { add, remove, isBlocked, getBlockedSet, unfollowBoth };
