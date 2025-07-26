
const Joi = require('joi');

const organizationSchema = Joi.object({
  name: Joi.string().required().max(100),
  slug: Joi.string().required().max(50).pattern(/^[a-z0-9-]+$/),
  domain: Joi.string().optional().allow(null),
  logo_url: Joi.string().optional().allow(null),
  primary_color: Joi.string().optional().pattern(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: Joi.string().optional().pattern(/^#[0-9A-Fa-f]{6}$/),
  plan_type: Joi.string().valid('starter', 'pro', 'enterprise').optional(),
  created_by_user_id: Joi.string().uuid().optional(),
  settings: Joi.object().optional(),
  features_config: Joi.object().optional().allow(null),
  billing_email: Joi.string().email().optional().allow(null),
  max_responses: Joi.number().integer().min(1).optional()
});

const organizationUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  domain: Joi.string().optional().allow(null),
  logo_url: Joi.string().optional().allow(null),
  primary_color: Joi.string().optional().pattern(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: Joi.string().optional().pattern(/^#[0-9A-Fa-f]{6}$/),
  plan_type: Joi.string().valid('starter', 'pro', 'enterprise').optional(),
  settings: Joi.object().optional(),
  features_config: Joi.object().optional().allow(null),
  billing_email: Joi.string().email().optional().allow(null),
  max_responses: Joi.number().integer().min(1).optional(),
  is_active: Joi.boolean().optional()
});

const validateOrganization = (req, res, next) => {
  const { error } = organizationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

const validateOrganizationUpdate = (req, res, next) => {
  const { error } = organizationUpdateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateOrganization,
  validateOrganizationUpdate
};
