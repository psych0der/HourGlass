const httpStatus = require('http-status');
const $ = require('cheerio');
const moment = require('moment-timezone');
const APIError = require('../utils/APIError');
const TimeTrack = require('../models/TimeTrack.js');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load timeTrack object and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const timeTrack = await TimeTrack.get(id);
    req.locals = { timeTrack };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.timeTrack.transform());

/**
 * Create new timeTrack
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const reqBody = Object.assign(req.body, { userId: req.params.userId });
    const timeTrack = new TimeTrack(reqBody);
    const savedTimeTrack = await timeTrack.save();
    res.status(httpStatus.CREATED);
    res.json(savedTimeTrack.transform());
  } catch (error) {
    if (error.message.indexOf('to be unique') > -1) {
      return next(
        new APIError({
          message: 'You cannot create more than 1 entry for a single date',
          status: httpStatus.PRECONDITION_FAILED,
        })
      );
    }
    next(error);
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const newTimeTrack = Object.assign(req.locals.timeTrack, req.body, {
      userId: req.params.userId,
    });
    const saveTimeTrack = await newTimeTrack.save();
    return res.json(saveTimeTrack.transform());
  } catch (error) {
    return next(error);
  }
};

/**
 * Get timeTrack list a user
 * @public
 */
exports.list = async (req, res, next) => {
  /* Fetch timeTrack list and total timeTrack count for a particular user to add hasNext and hasPrev flags */
  try {
    const { timeTracklist, count } = await TimeTrack.list(
      Object.assign(req.query, { userId: req.params.userId })
    );
    const transformedTimeTracks = timeTracklist.map(timeTrack =>
      timeTrack.transform()
    );
    const hasNext = (req.query.page || 1) < count;
    const hasPrev = (req.query.page || 1) > 1;
    res.json({
      timeTracks: transformedTimeTracks,
      hasNext,
      hasPrev,
      pages: count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get filtered timeTrack list between a date range for a user
 * @public
 */
exports.filterByDate = async (req, res, next) => {
  /* Fetch timeTrack list and total timeTrack count for a particular user between a date range to add
    hasNext and hasPrev flags
  */
  try {
    const { filteredTimeTracks, count } = await TimeTrack.filterByDate(
      Object.assign(req.query, { userId: req.params.userId })
    );

    const pageCount = Math.ceil(count / (req.query.perPage || 30));

    const transformedTimeTracks = filteredTimeTracks.map(timeTrack =>
      timeTrack.transform()
    );
    const hasNext = (req.query.page || 1) < pageCount;
    const hasPrev = (req.query.page || 1) > 1;
    res.json({
      timeTracks: transformedTimeTracks,
      hasNext,
      hasPrev,
      pages: pageCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get HTML report for tasks in a date range
 * @public
 */
exports.generateReport = async (req, res, next) => {
  // Fetch aggregate hours worked with notes in the date range
  try {
    const aggregateResult = await TimeTrack.aggregateWithinDateRange(
      Object.assign(req.query, { userId: req.params.userId })
    );

    const htmlBlocks = $(
      `<div><h1>Time report for: ${req.locals.user.name}</h1></div>`
    );
    if (aggregateResult.length > 0) {
      const formattedStartDate = moment(new Date(req.query.startDate)).format(
        'YYYY-MM-DD'
      );
      const formattedEndDate = moment(new Date(req.query.endDate)).format(
        'YYYY-MM-DD'
      );
      // aggregateResult.map(date => {
      const parent = $('<div class="date-group"></div>');
      parent.append(`<div><b>Start Date</b>: ${formattedStartDate}</div>`);
      parent.append(`<div><b>End Date</b>: ${formattedEndDate}</div>`);
      parent.append(
        `<div><b>Duration</b>: ${aggregateResult[0].total} hours</div>`
      );
      const notesList = $('<ul class="notes"></ul>');
      aggregateResult[0].notes.forEach(note => {
        notesList.append(`<li>${note}</li>`);
      });

      parent.append($('<div><b>Notes</b></div>').append(notesList));
      htmlBlocks.append(parent);
      // });
    } else {
      htmlBlocks.append(
        '<div class="no-time-tracked">No time tracked during this date range</div>'
      );
    }

    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(htmlBlocks.html()));
  } catch (error) {
    next(error);
  }
};

/**
 * Search time tracks for a particular user using query string.
 * @public
 */
exports.search = async (req, res, next) => {
  /* Fetch timeTrack list using search query for a particular user and total
    user count to add hasNext and hasPrev flags
  */
  try {
    const { searchResult, count } = await TimeTrack.search(
      Object.assign(req.query, { userId: req.params.userId })
    );
    const transformedTimeTracks = searchResult.map(timeTrack =>
      timeTrack.transform()
    );

    const pageCount = Math.ceil(count / (req.query.perPage || 30));

    const hasNext = (req.query.page || 1) < pageCount;
    const hasPrev = (req.query.page || 1) > 1;
    res.json({
      timeTracks: transformedTimeTracks,
      hasNext,
      hasPrev,
      pages: pageCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  try {
    const { timeTrack } = req.locals;
    timeTrack
      .remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(e));
  } catch (error) {
    next(error);
  }
};
