
const express = require('express');
const router = express.Router();

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Analytics service - Get analytics', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
