/**
 * Tweet controller: create, update, delete tweets; like/unlike; retweet/unretweet; feed.
 */
const tweetModel = require('../models/tweetModel');
const likeModel = require('../models/likeModel');
const followModel = require('../models/followModel');
const blockModel = require('../models/blockModel');
const userModel = require('../models/userModel');
const { validateTweetContent } = require('../utils/validators');

/**
 * POST /tweets - Create tweet. Auth required.
 */
async function createTweet(req, res, next) {
  try {
    const { content } = req.body;
    const err = validateTweetContent(content);
    if (err) return res.status(400).json({ error: err });
    const id = await tweetModel.create({
      author_id: req.user.id,
      content: content.trim(),
      original_tweet_id: null,
    });
    const tweet = await tweetModel.findById(id);
    res.status(201).json(tweet);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /tweets/:id - Update tweet. Author only; cannot edit if deleted.
 */
async function updateTweet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(id);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    if (tweet.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { content } = req.body;
    const err = validateTweetContent(content);
    if (err) return res.status(400).json({ error: err });
    const ok = await tweetModel.update(id, content);
    if (!ok) return res.status(403).json({ error: 'Cannot edit deleted tweet' });
    const updated = await tweetModel.findById(id);
    res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /tweets/:id - Soft delete. Author only. Removes likes.
 */
async function deleteTweet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(id);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    if (tweet.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await tweetModel.softDelete(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

/**
 * POST /tweets/:id/like - Like tweet. Auth required. Block check: cannot like if block between user and author.
 */
async function likeTweet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(id);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    const blocked = await blockModel.isBlocked(req.user.id, tweet.author_id) || await blockModel.isBlocked(tweet.author_id, req.user.id);
    if (blocked) return res.status(403).json({ error: 'Cannot like this tweet' });
    const already = await likeModel.exists(req.user.id, id);
    if (already) return res.status(200).json({ message: 'Already liked' });
    await likeModel.add(req.user.id, id);
    res.status(201).json({ message: 'Liked' });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /tweets/:id/like - Unlike.
 */
async function unlikeTweet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tweet id' });
    await likeModel.remove(req.user.id, id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

/**
 * POST /tweets/:id/retweet - Create retweet row. One per user per original. Block check.
 */
async function retweet(req, res, next) {
  try {
    const originalId = parseInt(req.params.id, 10);
    if (Number.isNaN(originalId)) return res.status(400).json({ error: 'Invalid tweet id' });
    const original = await tweetModel.findById(originalId);
    if (!original) return res.status(404).json({ error: 'Tweet not found' });
    const blocked = await blockModel.isBlocked(req.user.id, original.author_id) || await blockModel.isBlocked(original.author_id, req.user.id);
    if (blocked) return res.status(403).json({ error: 'Cannot retweet this tweet' });
    const already = await tweetModel.hasRetweeted(req.user.id, originalId);
    if (already) return res.status(409).json({ error: 'Already retweeted' });
    const id = await tweetModel.create({
      author_id: req.user.id,
      content: '', // retweet row can have empty content; original shown via original_tweet_id
      original_tweet_id: originalId,
    });
    const tweet = await tweetModel.findById(id);
    res.status(201).json(tweet);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /tweets/:id/retweet - Unretweet: soft-delete the retweet row (id = retweet tweet id).
 */
async function unretweet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(id);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    if (tweet.author_id !== req.user.id || tweet.original_tweet_id == null) {
      return res.status(403).json({ error: 'Not your retweet' });
    }
    await tweetModel.softDelete(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

/**
 * GET /feed - Cursor-based pagination. Excludes blocked users. Order: newest first.
 * Cursor format: created_at.getTime()_id (e.g. "1700000000000_5").
 */
async function getFeed(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const cursor = req.query.cursor;
    const userId = req.user.id;
    const blockedSet = await blockModel.getBlockedSet(userId);
    const db = require('../config/database');
    let sql = 'SELECT t.* FROM tweets t WHERE t.is_deleted = FALSE';
    const params = [];
    if (blockedSet.size > 0) {
      sql += ' AND t.author_id NOT IN (?)';
      params.push([...blockedSet]);
    }
    if (cursor) {
      const parts = cursor.split('_');
      const cTime = parts[0] ? parseInt(parts[0], 10) : NaN;
      const cId = parts[1] ? parseInt(parts[1], 10) : NaN;
      if (!Number.isNaN(cTime) && !Number.isNaN(cId)) {
        sql += ' AND (t.created_at, t.id) < (FROM_UNIXTIME(?/1000), ?)';
        params.push(cTime, cId);
      }
    }
    sql += ' ORDER BY t.created_at DESC, t.id DESC LIMIT ?';
    params.push(limit + 1);
    const [items] = await db.query(sql, params);
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last
      ? `${(last.created_at && last.created_at.getTime ? last.created_at.getTime() : new Date(last.created_at).getTime())}_${last.id}`
      : null;
    res.status(200).json({ feed: page, nextCursor });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createTweet,
  updateTweet,
  deleteTweet,
  likeTweet,
  unlikeTweet,
  retweet,
  unretweet,
  getFeed,
};
