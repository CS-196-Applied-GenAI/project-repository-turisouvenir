/**
 * Follow and block controllers.
 */
const followModel = require('../models/followModel');
const blockModel = require('../models/blockModel');

async function getFollowersCount(userId) {
  const ids = await followModel.getFollowerIds(userId);
  return ids.length;
}

/**
 * POST /users/:id/follow - Follow user. Cannot follow self. Cannot follow if block exists.
 */
async function follow(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
    const blocked = await blockModel.isBlocked(req.user.id, targetId) || await blockModel.isBlocked(targetId, req.user.id);
    if (blocked) return res.status(403).json({ error: 'Cannot follow this user' });
    const exists = await followModel.exists(req.user.id, targetId);
    if (exists) {
      const followersCount = await getFollowersCount(targetId);
      return res.status(200).json({ is_following: true, followers_count: followersCount });
    }
    await followModel.add(req.user.id, targetId);
    const followersCount = await getFollowersCount(targetId);
    res.status(201).json({ is_following: true, followers_count: followersCount });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /users/:id/follow - Unfollow.
 */
async function unfollow(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    await followModel.remove(req.user.id, targetId);
    const followersCount = await getFollowersCount(targetId);
    res.status(200).json({ is_following: false, followers_count: followersCount });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /users/:id/block - Block user. Unfollow both directions.
 */
async function block(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot block yourself' });
    await blockModel.unfollowBoth(req.user.id, targetId);
    const exists = await blockModel.isBlocked(req.user.id, targetId);
    if (!exists) await blockModel.add(req.user.id, targetId);
    res.status(200).json({ is_blocked: true });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /users/:id/block - Unblock.
 */
async function unblock(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (Number.isNaN(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    await blockModel.remove(req.user.id, targetId);
    res.status(200).json({ is_blocked: false });
  } catch (e) {
    next(e);
  }
}

module.exports = { follow, unfollow, block, unblock };
