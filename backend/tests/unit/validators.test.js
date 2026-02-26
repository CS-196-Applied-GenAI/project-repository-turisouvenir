/**
 * Unit tests for validators.
 */
const {
  validateUsername,
  validateEmail,
  validatePassword,
  validateTweetContent,
  validateCommentContent,
} = require('../../src/utils/validators');

describe('validateUsername', () => {
  it('returns null for valid username (3–20 chars, alphanumeric + underscore)', () => {
    expect(validateUsername('abc')).toBeNull();
    expect(validateUsername('user_1')).toBeNull();
    expect(validateUsername('A1b2C3')).toBeNull();
    expect(validateUsername('a'.repeat(20))).toBeNull();
  });

  it('returns error for too short', () => {
    expect(validateUsername('ab')).not.toBeNull();
    expect(validateUsername('')).not.toBeNull();
  });

  it('returns error for too long', () => {
    expect(validateUsername('a'.repeat(21))).not.toBeNull();
  });

  it('returns error for invalid characters', () => {
    expect(validateUsername('user-name')).not.toBeNull();
    expect(validateUsername('user name')).not.toBeNull();
    expect(validateUsername('user@')).not.toBeNull();
  });

  it('returns error for non-string', () => {
    expect(validateUsername(123)).not.toBeNull();
  });

  it('trims username before length check', () => {
    expect(validateUsername('  ab  ')).not.toBeNull();
    expect(validateUsername('   abc   ')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('a@b.com')).toBeNull();
    expect(validateEmail('user@example.org')).toBeNull();
  });
  it('returns error for invalid format', () => {
    expect(validateEmail('invalid')).not.toBeNull();
    expect(validateEmail('a@')).not.toBeNull();
    expect(validateEmail('@b.com')).not.toBeNull();
  });
  it('returns error for empty', () => {
    expect(validateEmail('')).not.toBeNull();
    expect(validateEmail('   ')).not.toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns null for valid password (8+ chars, 1 upper, 1 number)', () => {
    expect(validatePassword('Password1')).toBeNull();
    expect(validatePassword('Abcdef12')).toBeNull();
  });

  it('returns error for too short', () => {
    expect(validatePassword('Abcdef1')).not.toBeNull();
  });

  it('returns error for no uppercase', () => {
    expect(validatePassword('password1')).not.toBeNull();
  });

  it('returns error for no number', () => {
    expect(validatePassword('Password')).not.toBeNull();
  });

  it('returns error for non-string', () => {
    expect(validatePassword(12345678)).not.toBeNull();
  });
});

describe('validateTweetContent', () => {
  it('returns null for valid content (≤280 chars, ≥5 non-space)', () => {
    expect(validateTweetContent('Hello world today')).toBeNull();
    expect(validateTweetContent('a'.repeat(5))).toBeNull();
    expect(validateTweetContent('x'.repeat(280))).toBeNull();
  });

  it('returns error for over 280 chars', () => {
    expect(validateTweetContent('a'.repeat(281))).not.toBeNull();
  });

  it('returns error for fewer than 5 non-space chars', () => {
    expect(validateTweetContent('abc')).not.toBeNull();
    expect(validateTweetContent('ab cd')).not.toBeNull();
  });

  it('returns error for only whitespace', () => {
    expect(validateTweetContent('   ')).not.toBeNull();
  });
});

describe('validateCommentContent', () => {
  it('returns null for valid comment', () => {
    expect(validateCommentContent('Yes')).toBeNull();
    expect(validateCommentContent('a')).toBeNull();
  });

  it('returns error for over 280 chars', () => {
    expect(validateCommentContent('a'.repeat(281))).not.toBeNull();
  });

  it('returns error for only whitespace', () => {
    expect(validateCommentContent('   ')).not.toBeNull();
  });
});
