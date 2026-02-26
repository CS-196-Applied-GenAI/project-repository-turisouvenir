-- Full schema (Twitter clone spec)
-- For setup, run the numbered files in schema/ in order (see README).

USE chirper;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    username_lower VARCHAR(20) GENERATED ALWAYS AS (LOWER(username)) STORED,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_username_lower (username_lower),
    INDEX (username_lower)
);

CREATE TABLE tweets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    original_tweet_id INT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (author_id),
    INDEX (original_tweet_id),
    INDEX (author_id, original_tweet_id),
    UNIQUE KEY one_retweet_per_user_per_original (author_id, original_tweet_id),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
ALTER TABLE tweets ADD FOREIGN KEY (original_tweet_id) REFERENCES tweets(id) ON DELETE SET NULL;

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tweet_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_tweet (user_id, tweet_id),
    INDEX (user_id),
    INDEX (tweet_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE
);

CREATE TABLE follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    INDEX (following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE TABLE blocks (
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tweet_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (tweet_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE
);

CREATE TABLE blacklisted_tokens (
    token VARCHAR(512) PRIMARY KEY,
    expiration_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
