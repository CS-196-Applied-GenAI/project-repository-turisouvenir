/**
 * User routes: GET /users/:id, PUT /users/me, profile-picture, follow, block.
 */
const express = require('express');
const userController = require('../controllers/userController');
const followBlockController = require('../controllers/followBlockController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/suggested', requireAuth, userController.getSuggestedUsers);
router.get('/by-username/:username', requireAuth, userController.getUserByUsername);
router.get('/:id', requireAuth, userController.getUserById);
router.get('/:id/tweets', requireAuth, userController.getUserTweets);
router.get('/:id/followers', requireAuth, userController.getFollowers);
router.get('/:id/following', requireAuth, userController.getFollowing);
router.put('/me', requireAuth, userController.updateMe);
router.post('/me/profile-picture', requireAuth, upload.single('file'), userController.uploadProfilePicture);
router.post('/:id/follow', requireAuth, followBlockController.follow);
router.delete('/:id/follow', requireAuth, followBlockController.unfollow);
router.post('/:id/block', requireAuth, followBlockController.block);
router.delete('/:id/block', requireAuth, followBlockController.unblock);

module.exports = router;
