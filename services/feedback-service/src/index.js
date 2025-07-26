
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const feedbackRoutes = require('./routes/feedback');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

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
app.use('/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'feedback-service',
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
  console.log(`Feedback service running on port ${PORT}`);
});
