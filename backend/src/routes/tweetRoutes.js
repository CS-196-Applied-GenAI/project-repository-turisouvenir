/**
 * Tweet routes: CRUD, like, retweet, comments.
 */
const express = require('express');
const tweetController = require('../controllers/tweetController');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { tweetImagesUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/:id', requireAuth, tweetController.getTweetById);
router.post('/', requireAuth, tweetImagesUpload, tweetController.createTweet);
router.put('/:id', requireAuth, tweetController.updateTweet);
router.delete('/:id', requireAuth, tweetController.deleteTweet);
router.post('/:id/like', requireAuth, tweetController.likeTweet);
router.delete('/:id/like', requireAuth, tweetController.unlikeTweet);
router.post('/:id/retweet', requireAuth, tweetController.retweet);
router.delete('/:id/retweet', requireAuth, tweetController.unretweet);
router.post('/:id/comments', requireAuth, commentController.createComment);
router.get('/:id/comments', requireAuth, commentController.getComments);

module.exports = router;
