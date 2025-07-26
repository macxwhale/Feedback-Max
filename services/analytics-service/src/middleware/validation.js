
const Joi = require('joi');

const validateAnalyticsRequest = (req, res, next) => {
  const schema = Joi.object({
    organization_id: Joi.string().uuid().required()
  });

  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  // Validate query parameters
  const querySchema = Joi.object({
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
    category: Joi.string().optional(),
    window: Joi.string().valid('1h', '6h', '24h').optional(),
    format: Joi.string().valid('json', 'csv').optional()
  });

  const queryValidation = querySchema.validate(req.query);
  if (queryValidation.error) {
    return res.status(400).json({
      success: false,
      error: queryValidation.error.details[0].message
    });
  }

  next();
};

module.exports = { validateAnalyticsRequest };
