/**
 * S3 upload service for profile pictures.
 * Uses AWS SDK v3. Returns public URL of uploaded object.
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Check if mimetype and size are allowed.
 * @param {{ mimetype: string, size: number }}
 * @returns {{ ok: boolean, error?: string }}
 */
function validateFile(file) {
  if (!file) return { ok: false, error: 'No file provided' };
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return { ok: false, error: 'Allowed types: jpg, png, webp' };
  }
  if (file.size > MAX_SIZE) return { ok: false, error: 'File too large (max 2MB)' };
  return { ok: true };
}

/**
 * Upload buffer to S3 and return public URL.
 * Key: profile-pictures/{userId}-{timestamp}.{ext}
 * @param {Buffer} buffer
 * @param {number} userId
 * @param {string} mimetype
 * @returns {Promise<string>} URL
 */
async function uploadProfilePicture(buffer, userId, mimetype) {
  const ext = mimetype.split('/')[1] || 'jpg';
  const key = `profile-pictures/${userId}-${Date.now()}.${ext}`;
  const client = new S3Client({
    region: config.s3.region,
    credentials: config.s3.accessKeyId ? {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    } : undefined,
  });
  await client.send(new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    // ACL: 'public-read' if bucket allows; or use CloudFront/public URL pattern
  }));
  return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
}

module.exports = { validateFile, uploadProfilePicture };
