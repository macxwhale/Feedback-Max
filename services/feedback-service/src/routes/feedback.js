
const express = require('express');
const router = express.Router();

// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Feedback service - Get feedback', data: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    res.json({ message: 'Feedback service - Create feedback', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
