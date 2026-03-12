-- Add image support to tweets: up to 2 images stored as S3 URLs.

USE chirper;

ALTER TABLE tweets
  ADD COLUMN image_1_url VARCHAR(512) NULL AFTER content,
  ADD COLUMN image_2_url VARCHAR(512) NULL AFTER image_1_url;
