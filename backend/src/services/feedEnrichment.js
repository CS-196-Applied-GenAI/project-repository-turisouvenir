/**
 * Enriches raw tweet rows with author, counts, and current-user state.
 */
const db = require('../config/database');
const likeModel = require('../models/likeModel');
const tweetModel = require('../models/tweetModel');
const commentModel = require('../models/commentModel');

/**
 * Get author info for a user id.
 */
async function getAuthor(userId) {
  const [rows] = await db.query(
    'SELECT id, username, profile_picture_url FROM users WHERE id = ?',
    [userId]
  );
  const r = rows[0];
  if (!r) return { id: userId, username: 'unknown', profile_picture_url: null };
  return {
    id: r.id,
    username: r.username,
    profile_picture_url: r.profile_picture_url ?? null,
    level: 1, // Frontend expects level; backend doesn't have it
  };
}

/**
 * Get likes count for a tweet.
 */
async function getLikesCount(tweetId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS c FROM likes WHERE tweet_id = ?',
    [tweetId]
  );
  return rows[0]?.c ?? 0;
}

/**
 * Get retweets count (tweets that have original_tweet_id = tweetId).
 */
async function getRetweetsCount(tweetId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS c FROM tweets WHERE original_tweet_id = ? AND is_deleted = FALSE',
    [tweetId]
  );
  return rows[0]?.c ?? 0;
}

/**
 * Get comments count for a tweet.
 */
async function getCommentsCount(tweetId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS c FROM comments WHERE tweet_id = ?',
    [tweetId]
  );
  return rows[0]?.c ?? 0;
}

/**
 * Enrich a single tweet row for API response.
 * @param {object} row - Raw tweet row from DB
 * @param {number} currentUserId - Logged-in user id
 * @returns {Promise<object>} Enriched tweet
 */
async function enrichTweet(row, currentUserId) {
  if (!row) return null;
  const tweetId = row.id;
  const originalId = row.original_tweet_id;
  const authorId = row.author_id;

  const [author, likesCount, retweetsCount, commentsCount, isLiked, isRetweeted] = await Promise.all([
    getAuthor(authorId),
    getLikesCount(tweetId),
    getRetweetsCount(tweetId),
    getCommentsCount(tweetId),
    likeModel.exists(currentUserId, tweetId),
    originalId ? tweetModel.hasRetweeted(currentUserId, originalId) : Promise.resolve(false),
  ]);

  const base = {
    id: row.id,
    author_id: row.author_id,
    author,
    content: row.content,
    created_at: row.created_at,
    likes_count: likesCount,
    retweets_count: retweetsCount,
    comments_count: commentsCount,
    is_liked: !!isLiked,
    is_retweeted: !!isRetweeted,
    original_tweet_id: originalId || null,
  };

  if (originalId) {
    const [origRows] = await db.query(
      'SELECT * FROM tweets WHERE id = ? AND is_deleted = FALSE',
      [originalId]
    );
    const orig = origRows[0];
    if (orig) {
      const origAuthor = await getAuthor(orig.author_id);
      const origLikes = await getLikesCount(orig.id);
      const origRetweets = await getRetweetsCount(orig.id);
      const origComments = await getCommentsCount(orig.id);
      const origIsLiked = await likeModel.exists(currentUserId, orig.id);
      base.original_tweet = {
        id: orig.id,
        author_id: orig.author_id,
        author: origAuthor,
        content: orig.content,
        created_at: orig.created_at,
        likes_count: origLikes,
        retweets_count: origRetweets,
        comments_count: origComments,
        is_liked: !!origIsLiked,
        is_retweeted: base.is_retweeted,
      };
    }
  }

  return base;
}

/**
 * Enrich an array of tweet rows.
 */
async function enrichTweets(rows, currentUserId) {
  return Promise.all(rows.map((r) => enrichTweet(r, currentUserId)));
}

module.exports = { enrichTweet, enrichTweets };
