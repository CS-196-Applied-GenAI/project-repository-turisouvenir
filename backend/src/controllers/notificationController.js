/**
 * Notification controller.
 * Returns empty list for now - notifications feature can be added later.
 */
async function getNotifications(req, res, next) {
  try {
    res.status(200).json({ notifications: [] });
  } catch (e) {
    next(e);
  }
}

module.exports = { getNotifications };
