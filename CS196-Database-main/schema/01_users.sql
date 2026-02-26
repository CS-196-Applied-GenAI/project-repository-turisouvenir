USE chirper;

-- Users table (spec: id, username, password_hash, bio, profile_picture_url, created_at, updated_at)
-- Username 3–20 chars; case-insensitive uniqueness via username_lower
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    username_lower VARCHAR(20) GENERATED ALWAYS AS (LOWER(username)) STORED,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_username_lower (username_lower),
    INDEX (username_lower)
);
