
const Joi = require('joi');

const validateNotificationRequest = (req, res, next) => {
  const schema = Joi.object({
    organization_id: Joi.string().uuid().required(),
    type: Joi.string().valid('info', 'success', 'warning', 'error').required(),
    title: Joi.string().min(1).max(255).required(),
    message: Joi.string().min(1).max(1000).required(),
    user_id: Joi.string().uuid().optional(),
    metadata: Joi.object().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  next();
};

module.exports = { validateNotificationRequest };
