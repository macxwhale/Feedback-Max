
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'asset-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/assets', require('./routes/assets'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Asset service endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Asset service running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /health');
  console.log('  GET /api/assets');
  console.log('  POST /api/assets');
  console.log('  POST /api/assets/upload');
  console.log('  PUT /api/assets/:id');
  console.log('  DELETE /api/assets/:id');
  console.log('  GET /api/assets/themes');
  console.log('  POST /api/assets/themes');
});
