const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

/**
 * User Roles
 */
const roles = ['user', 'user-manager', 'super-admin'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
    },
    name: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    preferredWorkingHourPerDay: {
      type: Number,
      min: 0,
      max: 24,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'email',
      'role',
      'createdAt',
      'preferredWorkingHourPerDay',
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      exp: moment()
        .add(jwtExpirationInterval, 'minutes')
        .unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {
  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email)
      throw new APIError({
        message: 'An email is required to generate a token',
      });

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users specified by sortBy and sortOrder
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @returns {Promise<User[]>}
   */
  list({
    page = 1,
    perPage = 30,
    sortBy = 'createdAt',
    sortOrder = 1,
    name,
    email,
    role,
  }) {
    const options = omitBy({ name, email, role }, isNil);
    return this.find(options)
      .sort({ [sortBy]: sortOrder })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Search users specified by a query string(matching name or email address) and optionally sort using sortBy and sortOrder
   *
   * @param {number} page -  Skip to page specified if exists
   * @param {number} perPage - Number of results in a single request
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @returns {Promise<User[]>}
   */
  async search({
    page = 1,
    perPage = 30,
    sortBy = 'createdAt',
    sortOrder = 1,
    query,
  }) {
    const [searchResult, count] = await Promise.all([
      this.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .sort({ [sortBy]: sortOrder })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec(),
      this.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .count()
        .exec(),
    ]);

    return { searchResult, count };

    // return this.find({
    //   $or: [
    //     { name: { $regex: query, $options: 'i' } },
    //     { email: { $regex: query, $options: 'i' } },
    //   ],
    // })
    //   .sort({ [sortBy]: sortOrder })
    //   .skip(perPage * (page - 1))
    //   .limit(perPage)
    //   .exec();
  },

  /**
   * Count number of users in database according to search criteria
   *
   * @param {String} sortBy - Criteria to sort by
   * @param {Number} sortOrder - Sort order
   * @returns {Promise<User[]>}
   */
  count({ name, email, role }) {
    const options = omitBy({ name, email, role }, isNil);
    return this.find(options)
      .count()
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
};

/* Add text indices to name and email for text search */
userSchema.index({ name: 'text', email: 'text' });

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
