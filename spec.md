# Twitter Clone – Developer Specification

## 1. Overview

This project is a simplified Twitter-like social application where authenticated users can create and interact with tweets. The system supports authentication, profiles, social relationships, content creation, infinite scroll feed, and engagement features.

This specification is implementation-oriented and designed for React (frontend), Node.js (backend), MySQL (database), and AWS S3 (image storage).

---

## 2. Tech Stack

### Frontend
- React
- Tailwind CSS
- Infinite scroll (triggered by scroll event)
- JWT stored in `localStorage`

### Backend
- Node.js
- Express.js
- JWT authentication
- bcrypt for password hashing

### Database
- MySQL

### File Storage
- AWS S3 (profile picture uploads)

---

## 3. Authentication

### Login
- Users must log in to accomplish any task or view any content.
- Unauthenticated requests receive 401 and cannot access protected routes.

### Logout
- Users must be able to log out. After logout, the same token must not be accepted by the server.
- Client may call **POST /auth/logout** (with `Authorization: Bearer <token>`). Server invalidates that token (e.g. stores it in a `blacklisted_tokens` table until its expiry). After logout, the user cannot accomplish any tasks or view content until they log in again.

### JWT
- Single JWT access token
- Stored in `localStorage`
- Sent via `Authorization: Bearer <token>` header
- Protected routes must reject blacklisted (invalidated) tokens.

### Password Hashing
- Use bcrypt

---

## 4. User Model

### Fields
- id (PK)
- username (unique, case-insensitive)
- password_hash
- bio (nullable)
- profile_picture_url (nullable)
- created_at
- updated_at

### Username Rules
- 3–20 characters
- Letters, numbers, underscore only
- Case-insensitive uniqueness

### Password Rules
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

---

## 5. Profile Management

### Update Profile
Users may update:
- Bio
- Username (must remain unique)
- Profile picture

### Profile Picture Upload
- Stored in AWS S3
- Backend returns S3 URL
- Allowed types: jpg, png, webp
- Recommended max size: 2MB

---

## 6. Tweets

### Tweet Model
- id (PK)
- author_id (FK → users.id)
- content (TEXT)
- original_tweet_id (nullable, for retweets)
- is_deleted (boolean)
- created_at
- updated_at

### Rules
- Max length: 280 characters
- Minimum 5 non-space characters
- Cannot be only whitespace
- Users may edit anytime
- Edited tweets show "edited" label
- No edit history required

### Deleting Tweets
- Marks tweet as deleted
- Likes are permanently deleted
- Retweets remain but show "Deleted" as content

---

## 6b. Comments (Replies to Tweets)

### Comment Model
- id (PK)
- user_id (FK → users.id)
- tweet_id (FK → tweets.id)
- content (TEXT)
- created_at

### Rules
- Max length: 280 characters (same as tweets)
- Minimum 1 non-space character
- Only authenticated users may post comments
- Users may delete their own comments
- Block rules apply: blocked users cannot comment on each other’s tweets; comments from blocked users are not shown to the blocker and vice versa (e.g. exclude in listing)

### Deleting Comments
- Hard delete (remove row). No edit history required.

---

## 7. Likes

### Like Model
- id (PK)
- user_id (FK)
- tweet_id (FK)
- created_at

### Rules
- Users may like their own tweets
- Only one like per user per tweet (unique constraint)
- Deleted tweet → likes removed

---

## 8. Retweets

### Retweet Behavior
- Retweet creates a NEW tweet row
- `original_tweet_id` references original tweet

### Rules
- Users can retweet their own tweet
- Only one retweet per user per original tweet
- Deleting original tweet:
  - Retweets remain
  - Show "Deleted" content
- Unretweet = delete retweet row

---

## 9. Follow System

### Follow Model
- follower_id
- following_id
- created_at

### Rules
- Cannot follow self
- Cannot follow someone who has blocked you
- Blocking auto-unfollows both users

---

## 10. Block System

### Block Model
- blocker_id
- blocked_id
- created_at

### Effects
When User A blocks User B:

- They automatically unfollow each other
- B cannot follow A
- B cannot like/retweet A’s tweets
- B cannot see A’s tweets in feed
- A cannot see B’s tweets in feed
- Profile remains visible
- UI should show: "You are blocked / You have blocked this user"
- Past likes/retweets remain visible to others

---

## 11. Feed

### Pagination
- Cursor-based
- Infinite scroll
- Default page size: 50
- Request format:
  - `GET /feed?limit=50&cursor=<timestamp|id>`

### Feed Structure (Two-Bucket Priority)

Bucket 1:
- User’s own tweets
- Tweets from followed users

Bucket 2:
- All other tweets (excluding blocked users)

### Ordering
- Sort newest → oldest
- Retweets sorted by retweet creation time
- Cursor references the last item returned

---

## 12. Permissions & Access Control

### Must Be Authenticated To:
- View feed
- Create/edit/delete tweets
- Create/delete comments (replies)
- Follow/unfollow
- Block/unblock
- Like/unlike
- Retweet/unretweet

Unauthenticated users:
- Cannot view any content
- Cannot perform any actions

---

## 12b. Non-Negotiable Features

The app **must** support at least the following. Others may be added.

1. **Create an account** – Usernames unique; passwords have restrictions (per User Model).
2. **Login** – Required to accomplish any task or view content.
3. **Logout** – Token invalidated; user cannot use the app until logged in again.
4. **Update profile** – Bio, username, profile picture.
5. **Post (Tweet)** – Character limit on tweets (280).
6. **Delete a post** – Soft delete; likes removed; retweets remain with “Deleted” content.
7. **View a feed of recent tweets** – Newest to oldest; page size decided (e.g. 50); cursor-based.
8. **Refresh tweet feed** – Re-fetch feed (e.g. same endpoint, new cursor or reset).
9. **Follow a user**
10. **Unfollow a user**
11. **Block a user** – No content from blocked user visible to blocker, and vice versa.
12. **Unblock a user**
13. **Like a post**
14. **Unlike a post**
15. **Retweet a post**
16. **Unretweet a post**

---

## 13. API Endpoints (High-Level)

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/logout (invalidates current token; body/header: Bearer token)

### Profile
- GET /users/:id
- PUT /users/me
- POST /users/me/profile-picture

### Tweets
- POST /tweets
- PUT /tweets/:id
- DELETE /tweets/:id
- GET /feed

### Comments
- POST /tweets/:id/comments
- GET /tweets/:id/comments (paginated; exclude blocked)
- DELETE /comments/:id (author only)

### Likes
- POST /tweets/:id/like
- DELETE /tweets/:id/like

### Retweets
- POST /tweets/:id/retweet
- DELETE /tweets/:id/retweet

### Follow
- POST /users/:id/follow
- DELETE /users/:id/follow

### Block
- POST /users/:id/block
- DELETE /users/:id/block

---

## 14. Database Constraints

### Enforce:
- Unique(username lowercased)
- Unique(user_id, tweet_id) for likes
- Unique(user_id, original_tweet_id) for retweets
- Unique(follower_id, following_id)
- Unique(blocker_id, blocked_id)
- blacklisted_tokens: token (PK), expiration_time, created_at (for logout)

---

## 15. Edge Cases

- Cannot interact with blocked users
- Cannot follow blocked users
- Cannot retweet same tweet twice
- Editing deleted tweet not allowed
- Feed must exclude blocked relationships both directions
- Infinite scroll continues until no content remains

---

## 16. Non-Functional Requirements

- Passwords securely hashed (bcrypt)
- JWT secret stored in environment variables
- S3 credentials stored securely
- Input validation on all endpoints
- Proper HTTP status codes (400, 401, 403, 404)

---

END OF SPEC