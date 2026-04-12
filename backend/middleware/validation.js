const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    next();
  };
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  transaction: Joi.object({
    date: Joi.date().required(),
    description: Joi.string().min(1).required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('Income', 'Expense').required()
  })
};

module.exports = { validate, schemas };