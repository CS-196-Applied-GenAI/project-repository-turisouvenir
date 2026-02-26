# Schema alignment with project spec

This folder started from the professor’s proposed schema. The SQL files were updated so the database matches our Twitter-clone spec (`spec.md` in the project root). Summary of changes:

## Users (`01_users.sql`)

| Professor's schema | Our spec | Change |
|--------------------|----------|--------|
| `username` VARCHAR(50) UNIQUE | `username` VARCHAR(20), case-insensitive unique | Added `username_lower` (generated) + UNIQUE on it; max length 20 per spec |
| `email` | `email` VARCHAR(255) UNIQUE NOT NULL | Added (required for registration) |
| `name` | Not in spec | Removed |
| `profile_picture` | `profile_picture_url` | Renamed |
| No `updated_at` | `updated_at` | Added |
| `password_hash` TEXT | `password_hash` VARCHAR(255) | Kept NOT NULL; use VARCHAR for bcrypt output |

## Tweets (`02_tweets.sql`)

| Professor's schema | Our spec | Change |
|--------------------|----------|--------|
| `user_id` | `author_id` | Renamed (same meaning) |
| `text` VARCHAR(240) | `content` TEXT, max 280 | Renamed; length enforced in app |
| `retweeted_from` | `original_tweet_id` | Renamed; FK ON DELETE SET NULL so retweets remain when original is deleted |
| No soft delete | `is_deleted` BOOLEAN | Added; "delete" = set true, likes removed in app |
| No `updated_at` | `updated_at` | Added (for "edited" label) |
| `image_url` | Not in spec | Removed |

Retweets are the same tweet row shape: a row with `original_tweet_id` set. One retweet per user per original enforced by UNIQUE(`author_id`, `original_tweet_id`).

## Likes (`03_likes.sql`)

| Professor's schema | Our spec | Change |
|--------------------|----------|--------|
| Composite PK (tweet_id, user_id) | `id` PK + UNIQUE(user_id, tweet_id) | Added `id` AUTO_INCREMENT PK; kept unique on (user_id, tweet_id) |

## Comments (`04_comments.sql`)

- **Kept and added to spec.** Replies to tweets. Columns: id, user_id, tweet_id, content, created_at. Spec section 6b and endpoints POST/GET comments, DELETE comment. Column named `content` (not `contents`) to match spec.

## Blacklisted tokens (`05_auth.sql`)

- **Kept and added to spec.** Used for logout: server invalidates JWT by storing it in `blacklisted_tokens` until expiry. Spec section 3 (Logout) and POST /auth/logout. Auth middleware must reject blacklisted tokens.

## Follows (`05_follows.sql`)

| Professor's schema | Our spec | Change |
|--------------------|----------|--------|
| `followee_id` | `following_id` | Renamed to match spec |
| No self-follow check | Cannot follow self | Added CHECK (`follower_id` != `following_id`) |

## Blocks (`06_blocks.sql`)

- Already matched spec. Added CHECK (`blocker_id` != `blocked_id`) so self-block is rejected in the DB.

## Run order

Run schema files in this order: **00 → 01 → 02 → 03 → 04 → 05_follows → 06 → 05_auth**.
