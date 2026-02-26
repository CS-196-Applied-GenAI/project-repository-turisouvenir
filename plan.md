# Backend Build Plan – Twitter Clone

This document is a step-by-step blueprint for building the Node.js/Express/MySQL backend from the spec in `spec.md`. Steps are ordered so each builds on the previous and can be implemented and tested incrementally.

---

## Part 1: High-Level Blueprint

### Phase A: Foundation
- Project scaffolding, dependencies, environment config, MySQL connection, and a health-check endpoint.

### Phase B: Authentication
- User table and migrations, validation helpers, register and login endpoints, JWT issuance, and auth middleware.

### Phase C: Profile
- Get user by ID, update own profile (bio/username), and profile picture upload to S3 with URL in DB.

### Phase D: Tweets
- Tweets table, create/update/delete (soft delete), and authorization rules.

### Phase E: Likes
- Likes table, like/unlike endpoints, and cascade delete on tweet delete.

### Phase F: Retweets
- Retweet as new tweet row with `original_tweet_id`, one retweet per user per original, unretweet = delete row.

### Phase G: Follow System
- Follow table, follow/unfollow, block self-follow, and (later) integration with block rules.

### Phase H: Block System
- Block table, block/unblock, auto-unfollow both directions, and enforcement in follow/like/retweet/feed.

### Phase I: Feed
- Cursor-based pagination, two-bucket feed (following first, then others), exclude blocked users both ways.

---

## Part 2: Chunks (First Breakdown)

Each phase is split into chunks that can be implemented and tested in order.

| # | Chunk | Depends On |
|---|--------|------------|
| C1 | Project setup + health | — |
| C2 | DB connection + migrations runner | C1 |
| C3 | User table + validation helpers | C2 |
| C4 | Register + login + JWT middleware | C3 |
| C5 | GET user, PUT me (no picture yet) | C4 |
| C6 | S3 config + POST profile-picture | C5 |
| C7 | Tweets table + POST/PUT/DELETE tweets | C4 |
| C8 | Likes table + like/unlike | C7 |
| C9 | Retweet logic (POST/DELETE retweet) | C7, C8 |
| C10 | Follow table + follow/unfollow | C4 |
| C11 | Block table + block/unblock + unfollow | C10 |
| C12 | Block enforcement in follow/like/retweet | C11 |
| C13 | Feed: cursor pagination + two buckets + block filter | C9, C11 |

---

## Part 3: Small Steps (Second Breakdown)

Each chunk is broken into concrete, testable steps. Steps are sized so they can be implemented safely with focused tests and still move the project forward.

---

### C1: Project setup + health

| Step | Description | Test / Check |
|------|-------------|--------------|
| 1.1 | Create `package.json` with Node/Express and scripts (`start`, `dev`, `test`) | `npm run dev` runs |
| 1.2 | Add `.env.example` with `PORT`, `JWT_SECRET`, `DB_*`, `S3_*` placeholders; document each var | Env template complete |
| 1.3 | Create minimal Express app (no routes except 404); listen on `process.env.PORT` | Server starts, 404 for any path |
| 1.4 | Add `GET /health` returning 200 and a simple payload (e.g. `{ "status": "ok" }`) | `GET /health` → 200 |

---

### C2: DB connection + migrations runner

| Step | Description | Test / Check |
|------|-------------|--------------|
| 2.1 | Add MySQL client (e.g. `mysql2/promise`); create a DB helper that reads from env and exports a pool | Unit test or script: pool.query works |
| 2.2 | Add a migrations folder and a simple runner that runs `.sql` files in order (by filename or a table of applied migrations) | Runner applies a dummy migration |
| 2.3 | Document migration naming and how to run migrations (e.g. `npm run migrate`) | README or script |

---

### C3: User table + validation helpers

| Step | Description | Test / Check |
|------|-------------|--------------|
| 3.1 | Migration: create `users` table (id, username, password_hash, bio, profile_picture_url, created_at, updated_at); unique index on `LOWER(username)` | Migration runs; duplicate username (any case) fails |
| 3.2 | Add username validator: 3–20 chars, letters/numbers/underscore only; return clear error message | Unit tests for valid/invalid usernames |
| 3.3 | Add password validator: min 8 chars, ≥1 uppercase, ≥1 number; return clear error message | Unit tests for valid/invalid passwords |
| 3.4 | Optional: add a small in-memory or DB check that username is unique (case-insensitive) for use in register/update | Used in C4/C5 |

---

### C4: Register + login + JWT middleware

| Step | Description | Test / Check |
|------|-------------|--------------|
| 4.1 | POST /auth/register: validate body (username, password), hash with bcrypt, insert user; return 201 + user (no password_hash) | Integration test: register → 201, user in DB |
| 4.2 | On register, enforce uniqueness of username (case-insensitive); return 409 if duplicate | Test: duplicate username → 409 |
| 4.3 | POST /auth/login: validate body, find by username (case-insensitive), compare password with bcrypt; return 401 if invalid | Test: wrong password / unknown user → 401 |
| 4.4 | On successful login, issue JWT (include userId and optionally username); return token + user info | Test: login → 200, valid JWT |
| 4.5 | Add auth middleware: read `Authorization: Bearer <token>`, verify JWT, attach user (e.g. req.user); 401 if missing/invalid | Test: protected route without token → 401; with token → next() |

---

### C5: GET user, PUT me (no picture yet)

| Step | Description | Test / Check |
|------|-------------|--------------|
| 5.1 | GET /users/:id: return public user (id, username, bio, profile_picture_url, created_at); 404 if not found | Test: get existing user → 200; invalid id → 404 |
| 5.2 | PUT /users/me: auth required; accept bio and/or username; validate username if provided; update only authenticated user; return updated user | Test: update bio/username → 200; duplicate username → 409 |
| 5.3 | Ensure PUT /users/me cannot change password or id; optionally add a separate “change password” later | Spec: profile update only bio/username/picture |

---

### C6: S3 config + POST profile-picture

| Step | Description | Test / Check |
|------|-------------|--------------|
| 6.1 | Add AWS SDK (S3); config from env (bucket, region, credentials); helper to upload buffer and return public URL | Unit test with mock or localstack, or manual test |
| 6.2 | POST /users/me/profile-picture: auth required; accept multipart file; validate type (jpg, png, webp) and size (e.g. 2MB); upload to S3, store URL in users.profile_picture_url; return user | Test: upload → 200, URL in DB and response |
| 6.3 | Reject invalid type or oversized file with 400 | Test: wrong type / too large → 400 |

---

### C7: Tweets table + POST/PUT/DELETE tweets

| Step | Description | Test / Check |
|------|-------------|--------------|
| 7.1 | Migration: create `tweets` table (id, author_id, content, original_tweet_id, is_deleted, created_at, updated_at); FK author_id → users; index for feed (author_id, created_at) and original_tweet_id | Migration runs |
| 7.2 | Add content validator: max 280 chars, min 5 non-space chars, not only whitespace | Unit tests |
| 7.3 | POST /tweets: auth required; validate content; set author_id = req.user.id, original_tweet_id = null; return 201 + tweet | Test: create tweet → 201 |
| 7.4 | PUT /tweets/:id: auth required; only author can edit; reject if tweet is_deleted; validate content; set updated_at; return updated tweet | Test: edit own tweet → 200; edit deleted → 403/404; not author → 403 |
| 7.5 | DELETE /tweets/:id: auth required; only author; set is_deleted = true (soft delete); delete all likes for this tweet (per spec); return 204 | Test: delete tweet → 204; likes removed |

---

### C8: Likes table + like/unlike

| Step | Description | Test / Check |
|------|-------------|--------------|
| 8.1 | Migration: create `likes` table (id, user_id, tweet_id, created_at); unique (user_id, tweet_id); FK user_id, tweet_id | Migration runs; duplicate like fails |
| 8.2 | POST /tweets/:id/like: auth required; ensure tweet exists and not is_deleted; insert like (ignore if already liked per constraint); return 201 or 200 | Test: like → 201; duplicate → 200 or 409 handled |
| 8.3 | DELETE /tweets/:id/like: auth required; remove like for this user and tweet; return 204 | Test: unlike → 204 |

---

### C9: Retweet logic (POST/DELETE retweet)

| Step | Description | Test / Check |
|------|-------------|--------------|
| 9.1 | Enforce at most one retweet per user per original: unique (author_id, original_tweet_id) where original_tweet_id IS NOT NULL (or app-level check + unique partial index if supported) | Migration/constraint; test duplicate retweet → 409 |
| 9.2 | POST /tweets/:id/retweet: auth required; id = original tweet; ensure original exists; ensure user has not already retweeted it; create new tweet with author_id = req.user.id, original_tweet_id = id, content empty or placeholder; return 201 + retweet tweet | Test: retweet → 201; duplicate → 409 |
| 9.3 | DELETE /tweets/:id/retweet: auth required; id = retweet tweet (the one with original_tweet_id set); only retweet author can delete; soft-delete this tweet row (is_deleted = true); return 204 | Test: unretweet → 204; not retweet author → 403 |

---

### C10: Follow table + follow/unfollow

| Step | Description | Test / Check |
|------|-------------|--------------|
| 10.1 | Migration: create `follows` table (follower_id, following_id, created_at); unique (follower_id, following_id); FK both to users; check constraint or app logic: follower_id ≠ following_id | Migration runs; self-follow rejected |
| 10.2 | POST /users/:id/follow: auth required; id = user to follow; reject if id === req.user.id (cannot follow self); insert follow; return 201 or 200 | Test: follow → 201; self-follow → 400 |
| 10.3 | DELETE /users/:id/follow: auth required; remove row where follower_id = req.user.id and following_id = id; return 204 | Test: unfollow → 204 |

---

### C11: Block table + block/unblock + unfollow

| Step | Description | Test / Check |
|------|-------------|--------------|
| 11.1 | Migration: create `blocks` table (blocker_id, blocked_id, created_at); unique (blocker_id, blocked_id); FK both to users; blocker_id ≠ blocked_id | Migration runs |
| 11.2 | POST /users/:id/block: auth required; id = user to block; reject self-block; insert block; delete follows in both directions (A→B and B→A); return 201 or 200 | Test: block → 200; both unfollowed |
| 11.3 | DELETE /users/:id/block: auth required; remove block where blocker_id = req.user.id and blocked_id = id; return 204 | Test: unblock → 204 |

---

### C12: Block enforcement in follow / like / retweet

| Step | Description | Test / Check |
|------|-------------|--------------|
| 12.1 | Before allowing follow: if block exists (either direction) between req.user and target, return 403 | Test: follow blocked user or block follower → 403 |
| 12.2 | Before allowing like: if tweet author blocked req.user or req.user blocked author, return 403 | Test: like tweet from blocked user → 403 |
| 12.3 | Before allowing retweet: same block check as like (blocked cannot retweet); also enforce “only one retweet per user per original” if not already covered | Test: retweet from blocked user → 403 |

---

### C13: Feed (cursor pagination + two buckets + block filter)

| Step | Description | Test / Check |
|------|-------------|--------------|
| 13.1 | Helper: given user id, compute “blocked set” (users they block + users who block them) for feed filtering | Unit test or integration |
| 13.2 | GET /feed: auth required; cursor-based (cursor = last item’s created_at + id for tie-break); limit default 50; two buckets: (1) own tweets + from followed, (2) rest (excluding blocked in both directions); order newest first; retweets ordered by retweet created_at | Test: feed returns correct buckets and order; cursor works |
| 13.3 | Exclude soft-deleted tweets from feed; for retweets of deleted originals, still show retweet row but API can mark content as “deleted” (per spec) | Test: deleted tweets not in feed; retweets of deleted show correctly |
| 13.4 | When no cursor, return first page; when cursor provided, return next page; consistent ordering and no duplicates | Test: multiple pages; no duplicates across pages |

**Optional finer split for 13.2 (if it feels too large):**
- 13.2a: Implement cursor + limit only, single list (e.g. all non-deleted tweets for user), no buckets yet.
- 13.2b: Add bucket 1 (own + followed users’ tweets), sorted by created_at.
- 13.2c: Add bucket 2 (other users’ tweets), exclude blocked both ways; merge buckets with correct ordering.
- 13.2d: Handle retweets (order by retweet row’s created_at; include original_tweet_id / “deleted” content in response).

---

## Part 4: Dependency Graph (Summary)

```
1.1 → 1.2 → 1.3 → 1.4
  ↓
2.1 → 2.2 → 2.3
  ↓
3.1 → 3.2 → 3.3 → 3.4
  ↓
4.1 → 4.2 → 4.3 → 4.4 → 4.5
  ↓
5.1 → 5.2 → 5.3    6.1 → 6.2 → 6.3    10.1 → 10.2 → 10.3
  ↓                  ↑                    ↓
7.1 → 7.2 → 7.3 → 7.4 → 7.5            11.1 → 11.2 → 11.3
  ↓                                        ↓
8.1 → 8.2 → 8.3                    12.1 → 12.2 → 12.3
  ↓                                        ↓
9.1 → 9.2 → 9.3 ─────────────────────→ 13.1 → 13.2 → 13.3 → 13.4
```

- C5 and C6 can proceed in parallel after C4; C7 after C4; C10 after C4.
- C12 and C13 depend on C11; C13 also depends on C9.

---

## Part 5: Right-Sizing Notes

- **Small enough:** Each step has a single focus (one endpoint, one migration, one helper). “Test / Check” encourages a quick manual or automated test before moving on.
- **Big enough:** Steps are not single-line changes; they deliver a complete behavior (e.g. full POST /tweets with validation and DB write).
- **Safe ordering:** DB and migrations come before endpoints that use them; auth and middleware before protected routes; block table and unfollow before feed and block enforcement.
- **Iteration:** If a step feels too large (e.g. 13.2), split by: (1) cursor + limit only, (2) bucket 1 only, (3) bucket 2 + block filter, (4) tie-break and edge cases. If a step is too small, merge with the next (e.g. 3.2 and 3.3 can stay separate for clearer test targets).

---

## Part 6: Suggested Implementation Order (Linear)

For a single developer implementing in order:

1. **C1** (1.1–1.4)  
2. **C2** (2.1–2.3)  
3. **C3** (3.1–3.4)  
4. **C4** (4.1–4.5)  
5. **C5** (5.1–5.3)  
6. **C6** (6.1–6.3)  
7. **C7** (7.1–7.5)  
8. **C8** (8.1–8.3)  
9. **C9** (9.1–9.3)  
10. **C10** (10.1–10.3)  
11. **C11** (11.1–11.3)  
12. **C12** (12.1–12.3)  
13. **C13** (13.1–13.4)  

This order keeps dependencies satisfied and allows continuous testing after each step.
