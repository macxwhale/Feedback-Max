
const errorHandler = (err, req, res, next) => {
  console.error('Feedback service error:', err);

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          error: 'Invalid reference data'
        });
      case '23505': // Unique violation
        return res.status(400).json({
          success: false,
          error: 'Duplicate entry'
        });
      default:
        return res.status(500).json({
          success: false,
          error: 'Database error occurred'
        });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

module.exports = { errorHandler };
