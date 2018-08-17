const Joi = require('joi');
const User = require('../models/User');

module.exports = {
  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      sortBy: Joi.string().valid(['name', 'role', 'email', 'createdAt']),
      sortOrder: Joi.number().only([1, -1]),
      email: Joi.string(),
      role: Joi.string().valid(User.roles),
    },
  },
  // GET /v1/users/search
  searchUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      query: Joi.string().allow(''),
      sortBy: Joi.string().valid(['name', 'role', 'email', 'createdAt']),
      sortOrder: Joi.number().only([1, -1]),
    },
  },

  // POST /v1/users
  createUser: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(6)
        .max(128)
        .required(),
      name: Joi.string().max(128),
      preferredWorkingHourPerDay: Joi.number()
        .min(0)
        .max(24),
      role: Joi.string().valid(User.roles),
    },
  },

  // PATCH /v1/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      password: Joi.string()
        .min(6)
        .max(128),
      name: Joi.string().max(128),
      preferredWorkingHourPerDay: Joi.number()
        .min(0)
        .max(24),
      role: Joi.string().valid(User.roles),
    },
    params: {
      userId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
