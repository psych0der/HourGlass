const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');

const Joi = BaseJoi.extend(Extension);

module.exports = {
  // GET /v1/users/:userId/timeTracks/
  listTimeTracks: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      sortBy: Joi.string().valid(['date', 'duration', 'createdAt']),
      sortOrder: Joi.number().only([1, -1]),
      date: Joi.date(),
      note: Joi.string(),
    },
  },
  // GET /v1/users/:userId/timeTracks/filter-by-date
  dateFilterTimeTracks: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      sortBy: Joi.string().valid(['date', 'duration', 'createdAt']),
      sortOrder: Joi.number().only([1, -1]),
      endDate: Joi.date().required(),
      startDate: Joi.date().required(),
    },
  },

  // GET /v1/users/:userId/timeTracks/search
  searchTimeTracks: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      sortBy: Joi.string().valid(['date', 'duration', 'createdAt']),
      sortOrder: Joi.number().only([1, -1]),
      query: Joi.string()
        .allow('')
        .required(),
    },
  },

  // POST /v1/users/:userId/timeTracks
  createTimeTrack: {
    body: {
      note: Joi.string(),
      date: Joi.date().required(),
      duration: Joi.number()
        .min(0)
        .max(24)
        .required(),
    },
  },

  // PATCH /v1/users/:userId/timeTracks/:timeTrackId
  updateTimeTrack: {
    body: {
      note: Joi.string(),
      date: Joi.date(),
      duration: Joi.number()
        .min(0)
        .max(24),
    },
    params: {
      userId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
      timeTrackId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
