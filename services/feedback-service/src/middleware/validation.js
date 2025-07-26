
const Joi = require('joi');

const feedbackSessionSchema = Joi.object({
  organization_id: Joi.string().uuid().required(),
  user_id: Joi.string().uuid().optional().allow(null),
  phone_number: Joi.string().optional().allow(null),
  metadata: Joi.object().optional()
});

const feedbackResponseSchema = Joi.object({
  session_id: Joi.string().uuid().required(),
  question_id: Joi.string().uuid().required(),
  organization_id: Joi.string().uuid().required(),
  response_value: Joi.required(),
  score: Joi.number().integer().min(1).max(10).optional(),
  question_category: Joi.string().optional(),
  response_time_ms: Joi.number().integer().min(0).optional()
});

const questionSchema = Joi.object({
  organization_id: Joi.string().uuid().required(),
  question_text: Joi.string().required().max(500),
  question_type: Joi.string().required(),
  category: Joi.string().optional(),
  category_id: Joi.string().uuid().optional(),
  type_id: Joi.string().uuid().optional(),
  order_index: Joi.number().integer().min(0).optional(),
  is_required: Joi.boolean().optional(),
  validation_rules: Joi.object().optional(),
  conditional_logic: Joi.object().optional(),
  placeholder_text: Joi.string().optional().allow(null),
  help_text: Joi.string().optional().allow(null)
});

const validateFeedbackSession = (req, res, next) => {
  const { error } = feedbackSessionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

const validateFeedbackResponse = (req, res, next) => {
  const { error } = feedbackResponseSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

const validateQuestion = (req, res, next) => {
  const { error } = questionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateFeedbackSession,
  validateFeedbackResponse,
  validateQuestion
};
