# Integration Test Coverage – Proof

This document describes how to run integration tests with coverage and obtain proof for documentation or grading.

## Quick run

```bash
cd backend
npm run test:integration
```

## Output artifacts

| Artifact | Location | Use |
|----------|----------|-----|
| Console summary | stdout | Quick view of pass/fail and coverage percentages |
| HTML report | `coverage/index.html` | Open in browser for line-by-line coverage |
| JSON summary | `coverage/coverage-summary.json` | CI, scripts, or documentation embedding |

## Test suites (integration)

| Suite | Tests | Endpoints covered |
|-------|-------|-------------------|
| `auth.test.js` | 11 | POST /auth/register, /auth/login, /auth/logout |
| `users.test.js` | 12 | GET /users/:id, PUT /users/me, follow, unfollow, block, unblock |
| `tweets.test.js` | 14 | POST/GET/PUT/DELETE tweets, like, retweet, feed |
| `comments.test.js` | 6 | POST comments, GET comments, DELETE comments |
| `health.test.js` | 2 | GET /health, 404 handling |

**Total: 43 integration tests** across auth, users, tweets, feed, and comments.

## Coverage proof for submission

1. Run: `npm run test:integration`
2. Capture one of:
   - Screenshot of terminal output (tests passed + coverage summary)
   - Copy `coverage/coverage-summary.json` contents
   - Screenshot of `coverage/index.html` opened in a browser
