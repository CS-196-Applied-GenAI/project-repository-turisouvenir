/**
 * Comment routes: DELETE /comments/:id (author only).
 */
const express = require('express');
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.delete('/:id', requireAuth, commentController.deleteComment);

module.exports = router;
