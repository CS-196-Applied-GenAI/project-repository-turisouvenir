-- Notifications table: in-app notifications when someone you follow posts, likes, retweets, comments, or follows you.

USE chirper;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'recipient (who gets the notification)',
    actor_id INT NOT NULL COMMENT 'who did the action',
    type ENUM('chirp', 'like', 'retweet', 'comment', 'follow') NOT NULL,
    tweet_id INT NULL COMMENT 'for like/retweet/comment/chirp',
    content VARCHAR(500) NULL COMMENT 'tweet or comment preview',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id),
    INDEX (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE SET NULL
);
