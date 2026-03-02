/**
 * Comment controller: create, list, delete comments.
 */
const commentModel = require('../models/commentModel');
const tweetModel = require('../models/tweetModel');
const blockModel = require('../models/blockModel');
const { validateCommentContent } = require('../utils/validators');

/**
 * POST /tweets/:id/comments - Add comment. Block check: cannot comment if block between users.
 */
async function createComment(req, res, next) {
  try {
    const tweetId = parseInt(req.params.id, 10);
    if (Number.isNaN(tweetId)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(tweetId);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    const blocked = await blockModel.isBlocked(req.user.id, tweet.author_id) || await blockModel.isBlocked(tweet.author_id, req.user.id);
    if (blocked) return res.status(403).json({ error: 'Cannot comment on this tweet' });
    const { content } = req.body;
    const err = validateCommentContent(content);
    if (err) return res.status(400).json({ error: err });
    const id = await commentModel.create({
      user_id: req.user.id,
      tweet_id: tweetId,
      content: content.trim(),
    });
    const r = await commentModel.findById(id);
    if (!r) return res.status(500).json({ error: 'Failed to create comment' });
    const comment = {
      id: r.id,
      author_id: r.user_id,
      author: {
        id: r.user_id,
        username: r.username,
        profile_picture_url: r.profile_picture_url ?? null,
        level: 1,
      },
      content: r.content,
      created_at: r.created_at,
      tweet_id: r.tweet_id,
    };
    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /tweets/:id/comments - List comments (paginated). Exclude blocked.
 */
async function getComments(req, res, next) {
  try {
    const tweetId = parseInt(req.params.id, 10);
    if (Number.isNaN(tweetId)) return res.status(400).json({ error: 'Invalid tweet id' });
    const tweet = await tweetModel.findById(tweetId);
    if (!tweet) return res.status(404).json({ error: 'Tweet not found' });
    const blockedSet = await blockModel.getBlockedSet(req.user.id);
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await commentModel.getByTweetId(tweetId, blockedSet, limit, offset);
    const comments = rows.map((r) => ({
      id: r.id,
      author_id: r.user_id,
      author: {
        id: r.user_id,
        username: r.username,
        profile_picture_url: r.profile_picture_url ?? null,
        level: 1,
      },
      content: r.content,
      created_at: r.created_at,
      tweet_id: r.tweet_id,
    }));
    res.status(200).json({ comments });
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /comments/:id - Delete own comment only.
 */
async function deleteComment(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid comment id' });
    const comment = await commentModel.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await commentModel.deleteById(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { createComment, getComments, deleteComment };
