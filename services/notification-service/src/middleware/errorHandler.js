
const errorHandler = (err, req, res, next) => {
  console.error('Notification Service Error:', err);

  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Notification already exists'
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Referenced resource not found'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = { errorHandler };
