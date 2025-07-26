
const Joi = require('joi');

const validateAssetRequest = (req, res, next) => {
  const schema = Joi.object({
    organization_id: Joi.string().uuid().required(),
    asset_type: Joi.string().valid('logo', 'banner', 'image', 'document').required(),
    asset_url: Joi.string().uri().required(),
    asset_name: Joi.string().max(255).optional(),
    display_order: Joi.number().integer().min(0).optional(),
    mime_type: Joi.string().optional(),
    file_size: Joi.number().integer().min(0).optional()
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

module.exports = { validateAssetRequest };
