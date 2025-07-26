
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service routing configuration
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    path: '/api/auth'
  },
  organizations: {
    target: process.env.ORGANIZATION_SERVICE_URL || 'http://localhost:3002',
    path: '/api/organizations'
  },
  feedback: {
    target: process.env.FEEDBACK_SERVICE_URL || 'http://localhost:3003',
    path: '/api/feedback'
  },
  analytics: {
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
    path: '/api/analytics'
  },
  notifications: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    path: '/api/notifications'
  },
  sms: {
    target: process.env.SMS_SERVICE_URL || 'http://localhost:3006',
    path: '/api/sms'
  },
  assets: {
    target: process.env.ASSET_SERVICE_URL || 'http://localhost:3007',
    path: '/api/assets'
  }
};

// Create proxy middleware for each service
Object.entries(services).forEach(([serviceName, config]) => {
  app.use(config.path, createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: {
      [`^${config.path}`]: ''
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        error: `Service ${serviceName} unavailable`,
        message: 'Please try again later'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.originalUrl} to ${config.target}`);
    }
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service routes:');
  Object.entries(services).forEach(([name, config]) => {
    console.log(`  ${config.path} -> ${config.target}`);
  });
});
