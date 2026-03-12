/**
 * Notification model: insert and query notifications.
 * Types: chirp (someone you follow posted), like, retweet, comment, follow.
 */
const { query } = require('../config/database');

/**
 * Create a notification for a single user.
 * @param {{ userId: number, actorId: number, type: string, tweetId?: number, content?: string }}
 */
async function create({ userId, actorId, type, tweetId = null, content = null }) {
  await query(
    'INSERT INTO notifications (user_id, actor_id, type, tweet_id, content) VALUES (?, ?, ?, ?, ?)',
    [userId, actorId, type, tweetId, content]
  );
}

/**
 * Create notifications for multiple recipients (e.g. all followers when someone posts).
 */
async function createForMany(recipientIds, { actorId, type, tweetId = null, content = null }) {
  if (!recipientIds || recipientIds.length === 0) return;
  const values = recipientIds
    .filter((id) => id !== actorId) // don't notify self
    .map((id) => [id, actorId, type, tweetId, content]);
  if (values.length === 0) return;
  const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const flat = values.flat();
  await query(
    `INSERT INTO notifications (user_id, actor_id, type, tweet_id, content) VALUES ${placeholders}`,
    flat
  );
}

/**
 * Get notifications for a user, newest first.
 */
async function getByUserId(userId, limit = 50) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  const [rows] = await query(
    `SELECT n.id, n.type, n.tweet_id, n.content, n.created_at,
            u.id AS actor_id, u.username AS actor_username, u.profile_picture_url AS actor_profile_picture_url
     FROM notifications n
     JOIN users u ON n.actor_id = u.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT ${safeLimit}`,
    [userId]
  );
  return rows;
}

module.exports = { create, createForMany, getByUserId };
