
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'analytics-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/analytics', require('./routes/analytics'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Analytics service endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /health');
  console.log('  GET /api/analytics');
  console.log('  GET /api/analytics/organizations/:id');
  console.log('  GET /api/analytics/organizations/:id/questions');
  console.log('  GET /api/analytics/organizations/:id/realtime');
  console.log('  GET /api/analytics/organizations/:id/sentiment');
  console.log('  GET /api/analytics/organizations/:id/export');
});
