const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/timeTrack');
const {
  authorize,
  SUPER_ADMIN,
  USER,
  USER_MANAGER,
} = require('../../middlewares/auth');
const {
  listTimeTracks,
  dateFilterTimeTracks,
  searchTimeTracks,
  createTimeTrack,
  updateTimeTrack,
} = require('../../validations/timeTrack');

// We want to access params from the parent router
const router = express.Router({ mergeParams: true });

/**
 * Load timeTrack when API with timeTrackId route parameter is hit
 */
router.param('timeTrackId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/users/:userId/timeTracks List TimeTracks
   * @apiDescription Get a list of TimeTracks for a userId
   * @apiVersion 1.0.0
   * @apiName ListTimeTracks
   * @apiGroup TimeTrack
   * @apiPermission super-admin, loggedUser
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Number{1-}}         [page=1]     List page
   * @apiParam  (Query string) {Number{1-100}}      [perPage=30]  timeTracks per page
   * @apiParam  (Query string) {String="date", "duration", "createdAt"} [sortBy=date]     name of the field to sort by
   * @apiParam  (Query string) {Number=-1,1}       [sortOder=1] sort order (1 for ascending and -1 for descending)
   * @apiParam  (Query string) {Date}             [date]       date of timeTracks to be used as filter
   * @apiParam  (Query string) {String}             [note]      timeTrack's note to be used as filter
   *
   * @apiSuccess {Object[]}  TimeTrack List of timeTracks.
   * @apiSuccess {Boolean}  hasNext    specifies if next page of users list exist
   * @apiSuccess {Boolean}  hasPrev    specifies if previous page of users list exist
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER], true),
    validate(listTimeTracks),
    controller.list
  )
  /**
   * @api {post} v1/users/:userId/timeTracks/ Create timeTrack
   * @apiDescription Create a new timeTrack
   * @apiVersion 1.0.0
   * @apiName CreateTimeTrack
   * @apiGroup TimeTrack
   * @apiPermission super-admin, loggedUser
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}             [note]     Time track's note or textual description
   * @apiParam  {Number{0,24}}      duration   number of hours spent in this time track
   * @apiParam  {Date}              date       Date(yyyy-mm-dd) for the time track
   *
   * @apiSuccess (Created 201) {String}  id         TimeTrack's id
   * @apiSuccess (Created 201) {String}  note       TimeTrack's note
   * @apiSuccess (Created 201) {Number}  duration   Duration of time track
   * @apiSuccess (Created 201) {String}  userId     userId of timeTrack's owner
   * @apiSuccess (Created 201) {Date}    date       Date of time track
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   * @apiSuccess (Created 201) {Date}    updatedAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(
    authorize([SUPER_ADMIN, USER_MANAGER, USER], true),
    validate(createTimeTrack),
    controller.create
  );

router
  .route('/search')
  /**
   * @api {get} v1/users/:userId/timeTracks/search Search timeTracks
   * @apiDescription Search timeTracks of the specified user using query string
   * @apiVersion 1.0.0
   * @apiName SearchTimeTracks
   * @apiGroup TimeTrack
   * @apiPermission super-admin, loggedUser
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Number{1-}}         [page=1]     List page
   * @apiParam  (Query string) {Number{1-100}}      [perPage=30]  timeTracks per page
   * @apiParam  (Query string) {String="date", "duration", "createdAt"} [sortBy=date]     name of the field to sort by
   * @apiParam  (Query string) {Number=-1,1}       [sortOder=1] sort order (1 for ascending and -1 for descending)
   * @apiParam  (Query string) {String}             query      string to match notes in timeTracks of a particular user
   *
   * @apiSuccess {Object[]} TimeTrack List of timeTracks.
   * @apiSuccess {Boolean}  hasNext    specifies if next page of users list exist
   * @apiSuccess {Boolean}  hasPrev    specifies if previous page of users list exist
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER_MANAGER, USER], true),
    validate(searchTimeTracks),
    controller.search
  );

router
  .route('/filter-by-date')
  /**
   * @api {get} v1/users/:userId/timeTracks/filter-by-date filter timeTracks in a date-range
   * @apiDescription Filter timeTracks of the specified user between a date range
   * @apiVersion 1.0.0
   * @apiName FilterTimeTracks
   * @apiGroup TimeTrack
   * @apiPermission super-admin, loggedUser
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Number{1-}}         [page=1]     List page
   * @apiParam  (Query string) {Number{1-100}}      [perPage=30]  timeTracks per page
   * @apiParam  (Query string) {String="date", "duration", "createdAt"} [sortBy=date]     name of the field to sort by
   * @apiParam  (Query string) {Number=-1,1}       [sortOder=1] sort order (1 for ascending and -1 for descending)
   * @apiParam  (Query string) {Date}             startDate      lower limit of date range(yyyy-mm-dd) for filtering timeTracks
   * @apiParam  (Query string) {Date}             endDate        lower limit of date range(yyyy-mm-dd) for filtering timeTracks
   *
   * @apiSuccess {Object[]} TimeTrack List of timeTracks.
   * @apiSuccess {Boolean}  hasNext    specifies if next page of users list exist
   * @apiSuccess {Boolean}  hasPrev    specifies if previous page of users list exist
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER], true),
    validate(dateFilterTimeTracks),
    controller.filterByDate
  );

router
  .route('/generate-report')
  /**
   * @api {get} v1/users/:userId/timeTracks/generate-report filter timeTracks in a date-range and generates report of consolidated result
   * @apiDescription Filter timeTracks of the specified user between a date range
   * @apiVersion 1.0.0
   * @apiName GenerateConsolidatedTimeTrackReport
   * @apiGroup TimeTrack
   * @apiPermission super-admin, loggedUser
   *
   * @apiHeader {String} Authorization  Bearer followed by User's access token
   *
   * @apiParam  (Query string) {Date}             startDate      lower limit of date range(yyyy-mm-dd) for filtering timeTracks
   * @apiParam  (Query string) {Date}             endDate        lower limit of date range(yyyy-mm-dd) for filtering timeTracks
   *
   * @apiSuccess {String} Consolidated report in HTML format
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    authorize([SUPER_ADMIN, USER_MANAGER, USER], true),
    validate(dateFilterTimeTracks),
    controller.generateReport
  );

router
  .route('/:timeTrackId')
  /**
   * @api {get} v1/users/:userId/timeTracks/:timeTrackId Get TimeTrack object
   * @apiDescription Get timeTrack's information
   * @apiVersion 1.0.0
   * @apiName GetTimeTrack
   * @apiGroup TimeTrack
   * @apiPermission super-admin, user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess (Created 201) {String}  id         TimeTrack's id
   * @apiSuccess (Created 201) {String}  note       TimeTrack's note
   * @apiSuccess (Created 201) {Number}  duration   Duration of time track
   * @apiSuccess (Created 201) {String}  userId     userId of timeTrack's owner
   * @apiSuccess (Created 201) {Date}    date       Date of time track
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   * @apiSuccess (Created 201) {Date}    updatedAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .get(authorize([SUPER_ADMIN, USER_MANAGER, USER], true), controller.get)

  /**
   * @api {patch} v1/users/:userId/timeTracks/:timeTrackId Update TimeTrack
   * @apiDescription Update some fields of a TimeTrack document
   * @apiVersion 1.0.0
   * @apiName UpdateTimeTrack
   * @apiGroup TimeTrack
   * @apiPermission super-admin, user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}             [note]     Time track's note or textual description
   * @apiParam  {Number{0,24}}       duration   number of hours spent in this time track
   * @apiParam  {Date}               date       Date(yyyy-mm-dd) for the time track
   *
   * @apiSuccess (Created 201) {String}  id         TimeTrack's id
   * @apiSuccess (Created 201) {String}  note       TimeTrack's note
   * @apiSuccess (Created 201) {Number}  duration   Duration of time track
   * @apiSuccess (Created 201) {String}  userId     userId of timeTrack's owner
   * @apiSuccess (Created 201) {Date}    date       Date of time track
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   * @apiSuccess (Created 201) {Date}    updatedAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(
    authorize([SUPER_ADMIN, USER_MANAGER, USER], true),
    validate(updateTimeTrack),
    controller.update
  )
  /**
   * @api {delete} v1/users/:userId/timeTracks/:timeTrackId Delete TimeTrack
   * @apiDescription Delete a timeTrack
   * @apiVersion 1.0.0
   * @apiName DeleteTimeTrack
   * @apiGroup TimeTrack
   * @apiPermission super-admin, user
   *
   * @apiHeader {String} Authorization  User's access token prepended by `bearer`
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(
    authorize([SUPER_ADMIN, USER_MANAGER, USER], true),
    controller.remove
  );

module.exports = router;
