const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user');
const {
  authorize,
  SUPER_ADMIN,
  USER_MANAGER,
} = require('../../middlewares/auth');
const {
  listUsers,
  searchUsers,
  createUser,
  replaceUser,
  updateUser,
} = require('../../validations/user');

const timeTrackRouter = require('./timeTrack');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/users List Users
   * @apiDescription Get a list of users
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Number{1-}}         [page=1]     List page
   * @apiParam  (Query string) {Number{1-100}}      [perPage=30]  Users per page
   * @apiParam  (Query string) {String}             [name]       User's name
   * @apiParam  (Query string) {String}             [email]      User's email
   * @apiParam  (Query string) {String="email", "name", "role", "createdAt"} [sortBy=createdAt]     name of the field to sort by
   * @apiParam  (Query string) {Number=-1,1}       [sortOder=1] sort order (1 for ascending and -1 for descending)
   * @apiParam  (Query string) {String=user,user-manager, super-admin}  [role]       User's role
   *
   * @apiSuccess {Object[]} users List of users.
   * @apiSuccess {Boolean}  hasNext    specifies if next page of users list exist
   * @apiSuccess {Boolean}  hasPrev    specifies if previous page of users list exist
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER_MANAGER]),
    validate(listUsers),
    controller.list
  )
  /**
   * @api {post} v1/users Create User
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateUser
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}             email     User's email
   * @apiParam  {String{6..128}}     password  User's password
   * @apiParam  {String{..128}}      name    User's name
   * @apiParam  {String{..128}}      [preferredWorkingHourPerDay]    User's preferredWorkingHourPerDay
   * @apiParam  {String=user, user-manager, super-admin}  [role]    User's role
   *
   * @apiSuccess (Created 201) {String}  id         User's id
   * @apiSuccess (Created 201) {String}  name       User's name
   * @apiSuccess (Created 201) {String}  email      User's email
   * @apiSuccess (Created 201) {String}  role       User's role
   * @apiSuccess (Created 201) {Number}  user.preferredWorkingHourPerDay      User's preferredWorkingHourPerDay
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(
    authorize([SUPER_ADMIN, USER_MANAGER]),
    validate(createUser),
    controller.create
  );

router
  .route('/search')
  /**
   * @api {get} v1/users/search Search users
   * @apiDescription Search users using query string
   * @apiVersion 1.0.0
   * @apiName SearchUsers
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Number{1-}}         [page=1]     List page
   * @apiParam  (Query string) {Number{1-100}}      [perPage=30]  Users per page
   * @apiParam  (Query string) {String}             query      search query
   * @apiParam  (Query string) {String="email", "name", "role", "createdAt"} [sortBy=createdAt]     name of the field to sort by
   * @apiParam  (Query string) {Number=-1,1}       [sortOder=1] sort order (1 for ascending and -1 for descending)
   *
   * @apiSuccess {Object[]} users List of users.
   * @apiSuccess {Boolean}  hasNext    specifies if next page of users list exist
   * @apiSuccess {Boolean}  hasPrev    specifies if previous page of users list exist
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER_MANAGER]),
    validate(searchUsers),
    controller.search
  )

  .get(authorize);
router
  .route('/profile')
  /**
   * @api {get} v1/users/profile User Profile
   * @apiDescription Get logged in user profile information
   * @apiVersion 1.0.0
   * @apiName UserProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token prefixed with `bearer`
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {String}  preferredWorkingHourPerDay       User's preferredWorkingHourPerDay
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .get(authorize(), controller.loggedIn);

router
  .use('/:userId/timeTracks', timeTrackRouter) // mount timeTracker router at userId level
  .route('/:userId')
  /**
   * @api {get} v1/users/:id Get User
   * @apiDescription Get user information
   * @apiVersion 1.0.0
   * @apiName GetUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess (Created 201) {Number}  user.preferredWorkingHourPerDay      User's preferredWorkingHourPerDay
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .get(authorize(), controller.get)

  /**
   * @api {patch} v1/users/:id Update User
   * @apiDescription Update some fields of a user document
   * @apiVersion 1.0.0
   * @apiName UpdateUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}             email     User's email(user's email can only be updated by a super-admin or user-manager)
   * @apiParam  {String{6..128}}     password  User's password
   * @apiParam  {String{..128}}      [name]    User's name
   * @apiParam  {String=user,admin}  [role]    User's role
   * @apiParam  {String{..128}}      [preferredWorkingHourPerDay]    User's preferredWorkingHourPerDay
   * (You must be an super-admin or user-manager to change the user's role. Only super-admin can change super-admin's information)
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess (Created 201) {Number}  user.preferredWorkingHourPerDay      User's preferredWorkingHourPerDay
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(), validate(updateUser), controller.update)
  /**
   * @api {delete} v1/users/:id Delete User
   * @apiDescription Delete a user
   * @apiVersion 1.0.0
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token prepended by `bearer`
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(authorize([USER_MANAGER, SUPER_ADMIN]), controller.remove);

module.exports = router;
