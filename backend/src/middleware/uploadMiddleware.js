/**
 * Multer config for single file upload (profile picture).
 * Allowed: jpg, png, webp. Max 2MB.
 */
const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Allowed types: jpg, png, webp'));
  },
});

/** Multer for tweet creation: up to 2 images as image1, image2 */
const tweetImagesUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Allowed types: jpg, png, webp'));
  },
}).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
]);

module.exports = { upload, tweetImagesUpload };
