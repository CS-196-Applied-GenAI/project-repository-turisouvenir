/**
 * Health check route (no auth required).
 * Used by load balancers and monitoring.
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
