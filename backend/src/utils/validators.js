/**
 * Input validation helpers per spec.
 * Username: 3–20 chars, letters/numbers/underscore only.
 * Password: min 8 chars, at least 1 uppercase, at least 1 number.
 * Tweet content: max 280 chars, min 5 non-space chars, not only whitespace.
 */

const USERNAME_MIN = 3;
const USERNAME_MAX = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_UPPER_REGEX = /[A-Z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const TWEET_MAX = 280;
const TWEET_MIN_NONSPACE = 5;

/**
 * Validate username. Returns null if valid, or an error message string.
 * @param {string} username
 * @returns {string|null}
 */
function validateUsername(username) {
  if (typeof username !== 'string') return 'Username must be a string';
  const t = username.trim();
  if (t.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (t.length > USERNAME_MAX) return `Username must be at most ${USERNAME_MAX} characters`;
  if (!USERNAME_REGEX.test(t)) return 'Username may only contain letters, numbers, and underscore';
  return null;
}

/**
 * Validate password. Returns null if valid, or an error message string.
 * @param {string} password
 * @returns {string|null}
 */
function validatePassword(password) {
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (!PASSWORD_UPPER_REGEX.test(password)) return 'Password must contain at least one uppercase letter';
  if (!PASSWORD_NUMBER_REGEX.test(password)) return 'Password must contain at least one number';
  return null;
}

/**
 * Validate tweet content. Returns null if valid, or an error message string.
 * @param {string} content
 * @returns {string|null}
 */
function validateTweetContent(content) {
  if (typeof content !== 'string') return 'Content must be a string';
  if (content.length > TWEET_MAX) return `Tweet must be at most ${TWEET_MAX} characters`;
  const nonSpace = content.replace(/\s/g, '');
  if (nonSpace.length < TWEET_MIN_NONSPACE) return `Tweet must have at least ${TWEET_MIN_NONSPACE} non-space characters`;
  if (content.trim().length === 0) return 'Tweet cannot be only whitespace';
  return null;
}

/**
 * Validate comment content. Same max length as tweet; min 1 non-space.
 * @param {string} content
 * @returns {string|null}
 */
function validateCommentContent(content) {
  if (typeof content !== 'string') return 'Content must be a string';
  if (content.length > TWEET_MAX) return `Comment must be at most ${TWEET_MAX} characters`;
  if (content.replace(/\s/g, '').length < 1) return 'Comment must have at least one non-space character';
  return null;
}

module.exports = {
  validateUsername,
  validatePassword,
  validateTweetContent,
  validateCommentContent,
};
