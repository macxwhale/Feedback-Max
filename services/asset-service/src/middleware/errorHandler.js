
const errorHandler = (err, req, res, next) => {
  console.error('Asset Service Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File size too large. Maximum size is 10MB'
    });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }

  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Asset already exists'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = { errorHandler };
