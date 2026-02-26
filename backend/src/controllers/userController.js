/**
 * User controller: get user by id, update me, profile picture upload.
 */
const userModel = require('../models/userModel');
const { validateUsername, validateEmail } = require('../utils/validators');
const s3Service = require('../services/s3Service');

/**
 * GET /users/:id - Public profile (no auth required per spec for viewing profile).
 * Returns 404 if user not found.
 */
async function getUserById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
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
      return res.status(200).json(user);
    }
    await userModel.update(userId, updates);
    const user = await userModel.findById(userId);
    res.status(200).json(user);
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
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserById, updateMe, uploadProfilePicture };
