/**
 * Express application: routes and middleware.
 * MVC: routes delegate to controllers; middleware handles auth and errors.
 */
const express = require('express');
const cors = require('cors');
const swagger = require('./swagger');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationController = require('./controllers/notificationController');
const { errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/authMiddleware');
const tweetController = require('./controllers/tweetController');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- Routes ---
app.use('/api-docs', swagger.serve, swagger.setup);
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tweets', tweetRoutes);
app.use('/comments', commentRoutes);
app.get('/feed', requireAuth, tweetController.getFeed);
app.get('/notifications', requireAuth, notificationController.getNotifications);

// Multer errors (e.g. file too large) come as thrown errors; ensure 400
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 2MB)' });
  }
  if (err.message && err.message.includes('Allowed types')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// 404 for any other path
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
