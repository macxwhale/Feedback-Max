
const express = require('express');
const { AnalyticsController } = require('../controllers/AnalyticsController');
const { authenticateToken } = require('../middleware/auth');
const { validateAnalyticsRequest } = require('../middleware/validation');

const router = express.Router();
const analyticsController = new AnalyticsController();

// Organization analytics routes
router.get('/organizations/:organization_id', 
  authenticateToken, 
  validateAnalyticsRequest,
  analyticsController.getOrganizationAnalytics.bind(analyticsController)
);

router.get('/organizations/:organization_id/questions', 
  authenticateToken,
  analyticsController.getQuestionAnalytics.bind(analyticsController)
);

router.get('/organizations/:organization_id/realtime',
  authenticateToken,
  analyticsController.getRealTimeMetrics.bind(analyticsController)
);

router.get('/organizations/:organization_id/sentiment',
  authenticateToken,
  analyticsController.getSentimentAnalysis.bind(analyticsController)
);

router.get('/organizations/:organization_id/export',
  authenticateToken,
  analyticsController.exportAnalytics.bind(analyticsController)
);

// General analytics endpoints
router.get('/', async (req, res) => {
  try {
    res.json({ 
      message: 'Analytics service - Get analytics overview', 
      endpoints: [
        'GET /organizations/:id - Organization analytics',
        'GET /organizations/:id/questions - Question analytics',
        'GET /organizations/:id/realtime - Real-time metrics',
        'GET /organizations/:id/sentiment - Sentiment analysis',
        'GET /organizations/:id/export - Export analytics'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
