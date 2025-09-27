const Joi = require('joi');

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  batchNumber: Joi.string().required(),
  farmerID: Joi.string().required(),
  farmLocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required()
  }).required(),
  plantingDate: Joi.date().required(),
  harvestDate: Joi.date().required(),
  quality: Joi.string().required(),
  certifications: Joi.array().items(Joi.string()),
  currentOwner: Joi.string().required(),
  currentLocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required()
  }).required(),
  status: Joi.string().valid('PLANTED', 'HARVESTED', 'PROCESSED', 'IN_TRANSIT', 'DELIVERED', 'SOLD')
});

const farmerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  farmLocation: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required()
  }).required(),
  certifications: Joi.array().items(Joi.string()),
  metadata: Joi.object()
});

const supplyChainStepSchema = Joi.object({
  stepType: Joi.string().required(),
  actor: Joi.string().required(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required()
  }).required(),
  description: Joi.string().required(),
  metadata: Joi.object()
});

// Validation middleware functions
const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateFarmer = (req, res, next) => {
  const { error } = farmerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateSupplyChainStep = (req, res, next) => {
  const { error } = supplyChainStepSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateProduct,
  validateFarmer,
  validateSupplyChainStep
};