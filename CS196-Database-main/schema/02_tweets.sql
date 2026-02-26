USE chirper;

-- Tweets table (spec: id, author_id, content, original_tweet_id, is_deleted, created_at, updated_at)
-- Retweets are rows with original_tweet_id set. Max 280 chars; soft delete via is_deleted.
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
-- Self-referential FK added after table exists
ALTER TABLE tweets
    ADD FOREIGN KEY (original_tweet_id) REFERENCES tweets(id) ON DELETE SET NULL;
