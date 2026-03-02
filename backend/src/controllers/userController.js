/**
 * User controller: get user by id, by username, update me, profile picture, follow, block, tweets, followers, following.
 */
const userModel = require('../models/userModel');
const followModel = require('../models/followModel');
const blockModel = require('../models/blockModel');
const tweetModel = require('../models/tweetModel');
const { validateUsername, validateEmail } = require('../utils/validators');
const s3Service = require('../services/s3Service');
const { enrichTweets } = require('../services/feedEnrichment');

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? null,
    bio: row.bio ?? null,
    profile_picture_url: row.profile_picture_url ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function enrichUserWithCounts(userRow, currentUserId) {
  const user = toPublicUser(userRow);
  if (!user) return null;
  const [followersCount, followingCount, chirpsCount, isFollowing, isBlocked] = await Promise.all([
    followModel.getFollowerIds(user.id).then((ids) => ids.length),
    followModel.getFollowingIds(user.id).then((ids) => ids.length),
    tweetModel.countByAuthorId(user.id),
    followModel.exists(currentUserId, user.id),
    blockModel.isBlocked(currentUserId, user.id) || blockModel.isBlocked(user.id, currentUserId),
  ]);
  return {
    ...user,
    followers_count: followersCount,
    following_count: followingCount,
    chirps_count: chirpsCount,
    is_following: !!isFollowing,
    is_blocked: !!isBlocked,
    xp: 0,
    level: 1,
    streak: 0,
    badges: [],
  };
}

/**
 * GET /users/:id - Get user by id (auth required). Returns profile with counts.
 */
async function getUserById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const enriched = await enrichUserWithCounts(user, req.user.id);
    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/by-username/:username - Get user by username (auth required).
 */
async function getUserByUsername(req, res, next) {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username required' });
    const user = await userModel.findByUsername(username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const enriched = await enrichUserWithCounts(user, req.user.id);
    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/tweets - Get user's tweets (auth required).
 */
async function getUserTweets(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const blockedSet = await blockModel.getBlockedSet(req.user.id);
    if (blockedSet.has(id)) return res.status(404).json({ error: 'User not found' });
    const rows = await tweetModel.getByAuthorId(id, limit, offset);
    const enriched = await enrichTweets(rows, req.user.id);
    res.status(200).json({ tweets: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/followers - Get user's followers (auth required).
 */
async function getFollowers(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const followerIds = await followModel.getFollowerIds(id);
    const paged = followerIds.slice(offset, offset + limit);
    const users = await Promise.all(paged.map((uid) => userModel.findById(uid)));
    const valid = users.filter(Boolean);
    const enriched = await Promise.all(
      valid.map((u) => enrichUserWithCounts(u, req.user.id))
    );
    res.status(200).json({ users: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:id/following - Get users that this user follows (auth required).
 */
async function getFollowing(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const followingIds = await followModel.getFollowingIds(id);
    const paged = followingIds.slice(offset, offset + limit);
    const users = await Promise.all(paged.map((uid) => userModel.findById(uid)));
    const valid = users.filter(Boolean);
    const enriched = await Promise.all(
      valid.map((u) => enrichUserWithCounts(u, req.user.id))
    );
    res.status(200).json({ users: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/suggested - Get suggested users to follow (auth required).
 */
async function getSuggestedUsers(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const userId = req.user.id;
    const followingIds = await followModel.getFollowingIds(userId);
    const blockedSet = await blockModel.getBlockedSet(userId);
    const excludeIds = new Set([...followingIds, userId, ...blockedSet]);
    const db = require('../config/database');
    const placeholders = excludeIds.size > 0
      ? ' WHERE id NOT IN (' + [...excludeIds].map(() => '?').join(',') + ')'
      : '';
    const params = excludeIds.size > 0 ? [...excludeIds] : [];
    // Use literal LIMIT (validated int) - MySQL 8.0.22+ has a bug with LIMIT placeholder in prepared stmt
    const [rows] = await db.query(
      `SELECT id, username, email, bio, profile_picture_url, created_at FROM users ${placeholders} ORDER BY RAND() LIMIT ${limit}`,
      params
    );
    const enriched = await Promise.all(
      rows.map((u) => enrichUserWithCounts(u, userId))
    );
    res.status(200).json({ users: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /users/me - Update authenticated user's profile (bio, username, email).
 * Auth required. Cannot change password or id.
 */
async function updateMe(req, res, next) {
  try {
    const userId = req.user.id;
    const { bio, username, email } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = typeof bio === 'string' ? bio.trim() : null;
    if (username !== undefined) {
      const err = validateUsername(username);
      if (err) return res.status(400).json({ error: err });
      const taken = await userModel.isUsernameTaken(username, userId);
      if (taken) return res.status(409).json({ error: 'Username already taken' });
      updates.username = username.trim();
    }
    if (email !== undefined) {
      const err = validateEmail(email);
      if (err) return res.status(400).json({ error: err });
      const taken = await userModel.isEmailTaken(email, userId);
      if (taken) return res.status(409).json({ error: 'Email already taken' });
      updates.email = email.trim().toLowerCase();
    }
    if (Object.keys(updates).length === 0) {
      const user = await userModel.findById(userId);
      const enriched = await enrichUserWithCounts(user, userId);
      return res.status(200).json(enriched);
    }
    await userModel.update(userId, updates);
    const user = await userModel.findById(userId);
    const enriched = await enrichUserWithCounts(user, userId);
    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /users/me/profile-picture - Upload profile picture (multipart).
 * Auth required. Validates type (jpg, png, webp) and size (max 2MB), uploads to S3, updates user.
 */
async function uploadProfilePicture(req, res, next) {
  try {
    const file = req.file;
    const validation = s3Service.validateFile(file);
    if (!validation.ok) return res.status(400).json({ error: validation.error });
    const userId = req.user.id;
    const url = await s3Service.uploadProfilePicture(file.buffer, userId, file.mimetype);
    await userModel.update(userId, { profile_picture_url: url });
    const user = await userModel.findById(userId);
    const enriched = await enrichUserWithCounts(user, userId);
    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserById,
  getUserByUsername,
  getUserTweets,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
  updateMe,
  uploadProfilePicture,
};
