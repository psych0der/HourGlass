const httpStatus = require('http-status');
const { omit } = require('lodash');
const {
  SUPER_ADMIN,
  LOGGED_USER,
  USER_MANAGER,
} = require('../middlewares/auth');
const APIError = require('../utils/APIError');
const User = require('../models/User');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    /* Only super admin can create other super admins */
    const { user: loggedUser } = req;
    const reqBody = req.body;
    const user = new User(reqBody);
    if (loggedUser.role !== SUPER_ADMIN && user.role === SUPER_ADMIN) {
      throw new APIError({
        message: 'You are not allowed to create super admin',
        status: httpStatus.FORBIDDEN,
      });
    }
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const { user } = req;
  /* Only super-admin and user-manager can change user's email */
  if (![SUPER_ADMIN, USER_MANAGER].includes(user.role) && req.body.email) {
    throw new APIError({
      message: 'You are not allowed to change your email id',
      status: httpStatus.FORBIDDEN,
    });
  }

  const newUser = Object.assign(req.locals.user, req.body);

  if (user.role !== SUPER_ADMIN && newUser.role === SUPER_ADMIN) {
    throw new APIError({
      message: 'You are not authorized to perform this operation',
      status: httpStatus.FORBIDDEN,
    });
  }

  newUser
    .save()
    .then(savedUser => res.json(savedUser.transform()))
    .catch(e => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  /* Fetch user list and total user count to add hasNext and hasPrev flags */
  try {
    const [users, userCount] = await Promise.all([
      User.list(req.query),
      User.count(req.query),
    ]);

    const pageCount = Math.ceil(userCount / (req.query.perPage || 30));

    const transformedUsers = users.map(user => user.transform());
    const hasNext = (req.query.page || 1) < pageCount;
    const hasPrev = (req.query.page || 1) > 1;
    res.json({ users: transformedUsers, hasNext, hasPrev, pages: pageCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Search user using query string.
 * @public
 */
exports.search = async (req, res, next) => {
  /* Fetch user list using search query and total user count to add hasNext and hasPrev flags */
  try {
    const { searchResult, count } = await User.search(req.query);

    const pageCount = Math.ceil(count / (req.query.perPage || 30));

    const transformedUsers = searchResult.map(user => user.transform());
    const hasNext = (req.query.page || 1) < pageCount;
    const hasPrev = (req.query.page || 1) > 1;
    res.json({ users: transformedUsers, hasNext, hasPrev, pages: pageCount });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
