
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Notification service endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /health');
  console.log('  GET /api/notifications');
  console.log('  POST /api/notifications');
  console.log('  PUT /api/notifications/:id/read');
  console.log('  PUT /api/notifications/read-all');
  console.log('  DELETE /api/notifications/:id');
  console.log('  POST /api/notifications/bulk');
  console.log('  GET /api/notifications/organizations/:id/stats');
});
