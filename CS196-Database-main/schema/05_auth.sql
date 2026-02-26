USE chirper;

-- Blacklisted tokens table (for logout: invalidated JWTs until expiry)
CREATE TABLE blacklisted_tokens (
    token VARCHAR(512) PRIMARY KEY,
    expiration_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
