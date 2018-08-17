const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const httpStatus = require('http-status');
const { omitBy, isNil, some } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * User Schema
 * @private
 */
const timeTrackSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    note: {
      type: String,
      maxlength: 1024,
      index: true,
      trim: true,
    },
    duration: {
      type: Number,
      min: 0,
      max: 24,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/** add pre save hook to check total duration is not more than 24 hours
 */
timeTrackSchema.pre('save', async function save(next) {
  try {
    const { userId, date, duration } = this;
    const aggregateObject = await this.constructor.aggregate([
      { $match: { userId, date } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);
    const previousTotal = aggregateObject[0] || { total: 0 };
    if ((previousTotal.total || 0) + duration > 24) {
      throw new APIError({
        message: 'You cannot track more than 24 hours in a day',
        status: httpStatus.PRECONDITION_FAILED,
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
timeTrackSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'note',
      'date',
      'userId',
      'createdAt',
      'updatedAt',
      'duration',
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
timeTrackSchema.statics = {
  /**
   * Get time track entry
   *
   * @param {ObjectId} id - The objectId of timeTrack object.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let timeTrackObject;

      if (mongoose.Types.ObjectId.isValid(id)) {
        timeTrackObject = await this.findById(id).exec();
      }
      if (timeTrackObject) {
        return timeTrackObject;
      }

      throw new APIError({
        message: 'TimeTrack does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List timeTrack objects of particular user specified by sortBy and sortOrder and
   * optionally filtered by date, note or userId
   *
   * @param {number} skip - Number of timeTrack to be skipped.
   * @param {number} limit - Limit number of timeTrack to be returned.
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @returns {Promise<TimeTrack[]>}
   */
  async list({
    page = 1,
    perPage = 30,
    sortBy = 'date',
    sortOrder = -1,
    note,
    date,
    userId,
  }) {
    const options = omitBy({ note, date, userId }, isNil);
    const [timeTracklist, count] = await Promise.all([
      this.find(options)
        .sort({ [sortBy]: sortOrder })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec(),
      this.find(options)
        .count()
        .exec(),
    ]);

    return { timeTracklist, count };
  },

  /**
   * List timeTrack objects between specified dates
   * and sorted using attribute specified
   *
   * @param {number} skip - Number of timeTrack to be skipped.
   * @param {number} limit - Limit number of timeTrack to be returned.
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @param {Date} startDate - start date of range
   * @param {Date} endDate - end date for filter range
   * @param {String} userId - userId of the timetracks
   * @returns {Promise<TimeTrack[]>}
   */
  async filterByDate({
    page = 1,
    perPage = 30,
    sortBy = 'date',
    sortOrder = -1,
    startDate,
    endDate,
    userId,
  }) {
    const [filteredTimeTracks, count] = await Promise.all([
      this.find({
        $and: [
          { userId },
          { date: { $gte: startDate } },
          { date: { $lte: endDate } },
        ],
      })
        .sort({ [sortBy]: sortOrder })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec(),
      this.find({
        $and: [
          { userId },
          { date: { $gte: startDate } },
          { date: { $lte: endDate } },
        ],
      })
        .count()
        .exec(),
    ]);

    return { filteredTimeTracks, count };
  },

  /**
   * Generate aggregate report for time tracks between date range
   *
   * @param {Date} startDate - start date of range
   * @param {Date} endDate - end date for filter range
   * @param {String} userId - userId of the timetracks
   * @returns {Promise<Object>}
   */
  async aggregateWithinDateRange({ startDate, endDate, userId }) {
    const result = await this.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          userId: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' },
          notes: { $push: '$note' },
        },
      },
    ]);
    return result;
  },

  /**
   * Search timeTracks of a particular user specified by a query string matching note
   * and optionally sort using sortBy and sortOrder
   *
   * @param {number} page -  Skip to page specified if exists
   * @param {number} perPage - Number of results in a single request
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @param {String} userId - userId of the timetracks
   * @returns {Promise<TimeTrack[]>}
   */
  async search({
    page = 1,
    perPage = 30,
    sortBy = 'date',
    sortOrder = -1,
    query = '',
    userId,
  }) {
    const [searchResult, count] = await Promise.all([
      this.find({
        $and: [{ note: { $regex: query, $options: 'i' } }, { userId }],
      })
        .sort({ [sortBy]: sortOrder })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec(),
      this.find({
        $and: [{ note: { $regex: query, $options: 'i' } }, { userId }],
      })
        .count()
        .exec(),
    ]);

    return { searchResult, count };
  },

  /**
   * Count number of timeTracks in database according to search criteria
   *
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @param {String} userId - userId of the timetracks
   * @returns {Promise<User[]>}
   */
  count({ note, date, userId }) {
    const options = omitBy({ note, date, userId }, isNil);
    return this.find(options)
      .count()
      .exec();
  },
};

/* Add text index to note */
timeTrackSchema.index({ note: 'text' });
/* add unique constraint to user and date */
timeTrackSchema.index({ date: 1, userId: 1 }, { unique: true });

/* add unique constraint plugin */
timeTrackSchema.plugin(uniqueValidator);

/**
 * @typedef TimeTrack
 */
module.exports = mongoose.model('TimeTrack', timeTrackSchema);
