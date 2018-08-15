const httpStatus = require('http-status');
const passport = require('passport');
const User = require('../models/User');
const APIError = require('../utils/APIError');

const SUPER_ADMIN = 'super-admin';
const USER_MANAGER = 'user-manager';
const USER = 'user';
const LOGGED_USER = '_logged-user';

const handleJWT = (req, res, next, roles, onlyUserOrAdmin) => async (
  err,
  user,
  info
) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  // return error if user is not available or error is present
  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  // return error if token's user doesn't match with userId in param
  // and user is not Super admin or user manager
  const allowedActors = onlyUserOrAdmin
    ? [SUPER_ADMIN]
    : [SUPER_ADMIN, USER_MANAGER];
  if (
    !allowedActors.includes(user.role) &&
    req.params.userId !== user._id.toString()
  ) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  }
  if (!roles.includes(user.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  }
  if (err || !user) {
    return next(apiError);
  }

  req.user = user;

  return next();
};

exports.SUPER_ADMIN = SUPER_ADMIN;
exports.USER_MANAGER = USER_MANAGER;
exports.LOGGED_USER = LOGGED_USER;
exports.USER = USER;

/**
 * Authorization middleware for requests
 *  @param{Array} roles list of possible roles for user
 *  @param{Boolean} onlyUserOrAdmin specifies if only user itself or super-admin
 *  is allowed to request/manipulate resources of the user. This refers to requests URIs containing
 *  userId
 */
exports.authorize = (roles = User.roles, onlyUserOrAdmin = false) => (
  req,
  res,
  next
) =>
  passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next, roles, onlyUserOrAdmin)
  )(req, res, next);
