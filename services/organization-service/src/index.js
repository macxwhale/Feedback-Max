
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const organizationRoutes = require('./routes/organizations');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/organizations', organizationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'organization-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Organization service running on port ${PORT}`);
});
