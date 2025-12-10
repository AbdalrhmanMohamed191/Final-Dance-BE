const Joi = require("joi");


const createBookSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  author: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid("novel", "education", "science", "religion", "kids", "other").default("other")
    .required(),
  condition: Joi.string().valid("new", "good", "old").required(),
  inStock: Joi.boolean().required(),
  image: Joi.string().optional(),
});

const updateBookSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional(),
  author: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string()
    .valid("novel", "education", "science", "religion", "kids", "other")
    .optional(),
  condition: Joi.string().valid("new", "good", "old").optional(),
  inStock: Joi.boolean().optional(),
  image: Joi.string().optional(),

});

module.exports = {
  createBookSchema,
  updateBookSchema,
};