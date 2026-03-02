/**
 * Auth controller: register, login, logout.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');
const blacklistModel = require('../models/blacklistModel');
const { validateUsername, validateEmail, validatePassword } = require('../utils/validators');

const SALT_ROUNDS = 10;

/**
 * POST /auth/register
 * Body: { username, email, password, bio? }
 */
async function register(req, res, next) {
  try {
    const { username, email, password, bio } = req.body;
    const usernameErr = validateUsername(username);
    if (usernameErr) return res.status(400).json({ error: usernameErr });
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });
    const passwordErr = validatePassword(password);
    if (passwordErr) return res.status(400).json({ error: passwordErr });

    const taken = await userModel.isUsernameTaken(username);
    if (taken) return res.status(409).json({ error: 'Username already taken' });
    const emailTaken = await userModel.isEmailTaken(email);
    if (emailTaken) return res.status(409).json({ error: 'Email already taken' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = await userModel.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      bio: bio != null ? String(bio).trim() : null,
    });
    const user = await userModel.findById(id);
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    const payload = jwt.verify(token, config.jwt.secret);
    res.status(201).json({
      token,
      user: toPublicUser(user),
      expiresAt: payload.exp,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Body: { username, password }
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await userModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    const payload = jwt.verify(token, config.jwt.secret);
    res.status(200).json({
      token,
      user: toPublicUser(user),
      expiresAt: payload.exp,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 * Requires Authorization: Bearer <token>. Puts token on blacklist.
 */
async function logout(req, res, next) {
  try {
    const token = req.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const payload = jwt.decode(token);
    const exp = payload && payload.exp ? payload.exp : Math.floor(Date.now() / 1000) + 86400;
    await blacklistModel.add(token, exp);
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

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

module.exports = { register, login, logout };
