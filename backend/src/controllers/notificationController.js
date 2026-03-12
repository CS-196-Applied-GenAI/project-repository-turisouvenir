/**
 * Notification controller - in-app notifications.
 */
const notificationModel = require('../models/notificationModel');

/**
 * GET /notifications - Returns notifications for the current user.
 */
async function getNotifications(req, res, next) {
  try {
    const rows = await notificationModel.getByUserId(req.user.id, 50);
    const notifications = rows.map((r) => ({
      id: String(r.id),
      type: r.type,
      user: {
        username: r.actor_username,
        profile_picture_url: r.actor_profile_picture_url ?? '',
        level: 1,
      },
      content: r.content ?? undefined,
      timestamp: r.created_at,
      tweet_id: r.tweet_id,
    }));
    res.status(200).json({ notifications });
  } catch (e) {
    next(e);
  }
}

module.exports = { getNotifications };
