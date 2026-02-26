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

### JWT
- Single JWT access token
- Stored in `localStorage`
- Sent via `Authorization: Bearer <token>` header

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
- Follow/unfollow
- Block/unblock
- Like/unlike
- Retweet/unretweet

Unauthenticated users:
- Cannot view any content
- Cannot perform any actions

---

## 13. API Endpoints (High-Level)

### Auth
- POST /auth/register
- POST /auth/login

### Profile
- GET /users/:id
- PUT /users/me
- POST /users/me/profile-picture

### Tweets
- POST /tweets
- PUT /tweets/:id
- DELETE /tweets/:id
- GET /feed

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