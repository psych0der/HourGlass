/* eslint-disable no-unused-expressions */
/* user bluebird promises */
Promise = require('bluebird');

const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const $ = require('cheerio');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../config/express');
const mongoose = require('../../../config/mongoose');
const User = require('../../models/User');
const TimeTrack = require('../../models/TimeTrack');
const { SUPER_ADMIN, USER_MANAGER } = require('../../middlewares/auth');
const JWT_EXPIRATION = require('../../../config/vars').jwtExpirationInterval;

/**
 * root level hooks
 */

describe('TimeTrack API', () => {
  let superAdminAccessToken;
  let userManagerAccessToken;
  let userAccessToken;
  let dbUsers;
  let user;
  let superAdmin;
  let userManager;
  let timeTrackId;

  const password = '123456';
  const passwordHashed = bcrypt.hashSync(password, 1);

  // setup
  beforeAll(async () => {
    mongoose.connect();
  });

  // teardown
  afterAll(async () => {
    mongoose.connection.close();
  });

  beforeEach(async () => {
    dbUsers = {
      branStark: {
        email: 'branstark@gmail.com',
        password: passwordHashed,
        name: 'Bran Stark',
        role: SUPER_ADMIN,
      },
      jonSnow: {
        email: 'jonsnow@gmail.com',
        password: passwordHashed,
        name: 'Jon Snow',
      },
      tyrionLanister: {
        email: 'tyrion@gmail.com',
        password: passwordHashed,
        name: 'Tyrion Lanister',
        role: USER_MANAGER,
      },
    };

    await User.remove({});
    await TimeTrack.remove({});

    await User.insertMany([
      dbUsers.branStark,
      dbUsers.jonSnow,
      dbUsers.tyrionLanister,
    ]);
    dbUsers.branStark.password = password;
    dbUsers.jonSnow.password = password;
    dbUsers.tyrionLanister.password = password;
    superAdminAccessToken = (await User.findAndGenerateToken(dbUsers.branStark))
      .accessToken;
    userManagerAccessToken = (await User.findAndGenerateToken(
      dbUsers.tyrionLanister
    )).accessToken;
    userAccessToken = (await User.findAndGenerateToken(dbUsers.jonSnow))
      .accessToken;
  });

  describe('POST /v1/users/:userId/timeTracks/', async () => {
    it('should create a new timeTrack for some user when logged user is super-admin', async () => {
      const userManagerId = (await User.findOne({
        email: dbUsers.tyrionLanister.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        date: '2018-08-16',
        duration: 2,
      };
      return request(app)
        .post(`/v1/users/${userManagerId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.CREATED)
        .then(res => {
          timeTrack.date = new Date(timeTrack.date).toISOString();
          expect(res.body).to.include(timeTrack);
        });
    });

    it('should not create a new timeTrack for some user when logged user is user-manager', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        date: '2018-08-16',
        duration: 2,
      };
      return request(app)
        .post(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });

    it('should not create a new timeTrack for some user when logged user has regular user role', async () => {
      const superAdminId = (await User.findOne({
        email: dbUsers.branStark.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        date: '2018-08-16',
        duration: 2,
      };
      return request(app)
        .post(`/v1/users/${superAdminId}/timeTracks/`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });

    it('should report error when date is not provided', async () => {
      const userManagerId = (await User.findOne({
        email: dbUsers.tyrionLanister.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        duration: 2,
      };

      return request(app)
        .post(`/v1/users/${userManagerId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('date');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"date" is required');
        });
    });

    it('should report error when duration is greater than 24', async () => {
      const userManagerId = (await User.findOne({
        email: dbUsers.tyrionLanister.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        duration: 25,
        date: '2019-10-12',
      };

      return request(app)
        .post(`/v1/users/${userManagerId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('duration');
          expect(location).to.be.equal('body');
          expect(messages).to.include(
            '"duration" must be less than or equal to 24'
          );
        });
    });

    it('should report error more than 1 entry is created for a date', async () => {
      const userManagerId = (await User.findOne({
        email: dbUsers.tyrionLanister.email,
      }))._id;
      // create an entry for date with 20 hours
      await TimeTrack.insertMany({
        note: 'sample',
        duration: 20,
        date: '2019-10-12',
        userId: userManagerId,
      });
      const timeTrack = {
        note: 'sample',
        duration: 5,
        date: '2019-10-12',
      };

      return request(app)
        .post(`/v1/users/${userManagerId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.PRECONDITION_FAILED)
        .then(res => {
          expect(res.body.message).to.be.equal(
            'You cannot create more than 1 entry for a single date'
          );
        });
    });

    it('should report error when duration is not provided', async () => {
      const userManagerId = (await User.findOne({
        email: dbUsers.tyrionLanister.email,
      }))._id;
      const timeTrack = {
        note: 'sample',
        date: '2018-08-16',
      };

      return request(app)
        .post(`/v1/users/${userManagerId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(timeTrack)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('duration');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"duration" is required');
        });
    });
  });
  describe('GET /v1/users/:userId/timeTracks', () => {
    /* Create time track entries for jonSnow */
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'Hi again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
    });
    it('should list timeTracks of a user if it is logged in itself', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(3);
        });
    });

    it('should list timeTracks of a user if logged in user is super-admin', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(3);
        });
    });

    it('should not list timeTracks of a user if the logged in user is user-manager', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });

    it('should get all timeTracks with pagination', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ page: 3, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(1);
          expect(res.body.hasPrev).to.be.true;
          expect(res.body.hasNext).to.be.false;
        });
    });

    it('should filter timeTracks by date', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ date: '2018-08-09' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(1);
          expect(res.body.hasPrev).to.be.false;
          expect(res.body.hasNext).to.be.false;
        });
    });

    it("should report error when pagination's parameters are not a number", async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ page: '?', perPage: 'whaat' })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });

  describe('GET /v1/users/:userId/timeTracks/filter-by-date', () => {
    /* Create time track entries for jonSnow */
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'Hi again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
    });
    it('should filter timeTracks of a user if it is logged in itself', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(2);
        });
    });

    it('should filter timeTracks of a user is user logged in has super-admin role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(2);
        });
    });

    it('should report error when startDate and endDate are not provided', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({})
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('endDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"endDate" is required');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('startDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"startDate" is required');
        });
    });

    it('should report error when startDate and endDate are not in proper date format', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ startDate: '1aaa', endDate: 'qq11' })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('endDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include(
            '"endDate" must be a number of milliseconds or valid date string'
          );
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('startDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include(
            '"startDate" must be a number of milliseconds or valid date string'
          );
        });
    });

    it('should not filter timeTracks of a user if the logged in user is user-manager', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });

    it('should get all timeTracks with pagination', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({
          startDate: '2018-08-09',
          endDate: '2018-08-10',
          page: 2,
          perPage: 1,
        })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(1);
        });
    });

    it('should handle pagination overflow ', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({
          startDate: '2018-08-09',
          endDate: '2018-08-10',
          page: 3,
          perPage: 1,
        })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.hasPrev).to.equal(true);
          expect(res.body.hasNext).to.equal(false);
          expect(res.body.timeTracks).to.have.lengthOf(0);
        });
    });

    it("should report error when pagination's parameters are not a number", async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/filter-by-date`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({
          page: '?',
          perPage: 'whaat',
          startDate: '2018-08-09',
          endDate: '2018-08-10',
        })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });

  describe('GET /v1/users/:userId/timeTracks/generate-report', () => {
    /* Create time track entries for jonSnow */
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'Hi again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
    });
    it('should generate report for  timeTrack between a date range of a user if it is logged in itself', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/generate-report`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.headers['content-type']).to.be.equal(
            'text/html; charset=utf-8'
          );
          const resp = $(res.text);
          const parent = $('<div></div>').append(resp);
          expect(resp[0].tagName).to.equal('h1');
          expect($(parent.find('.date-group')).length).to.equal(1);
          expect($(parent.find('.notes')).length).to.equal(1);
          expect($(parent.find('.notes')[0]).length).to.equal(1);
        });
    });

    it('should generate report for  timeTrack between a date range of a user logged user has super-admin role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/generate-report`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.headers['content-type']).to.be.equal(
            'text/html; charset=utf-8'
          );
          const resp = $(res.text);
          const parent = $('<div></div>').append(resp);
          expect(resp[0].tagName).to.equal('h1');
          expect($(parent.find('.date-group')).length).to.equal(1);
          expect($(parent.find('.notes')).length).to.equal(1);
          expect($(parent.find('.notes')[0]).length).to.equal(1);
        });
    });

    it('should report error when startDate and endDate are not provided', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/generate-report`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({})
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('endDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"endDate" is required');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('startDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"startDate" is required');
        });
    });

    it('should report error when startDate and endDate are not in proper date format', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/generate-report`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ startDate: '1aaa', endDate: 'qq11' })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('endDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include(
            '"endDate" must be a number of milliseconds or valid date string'
          );
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('startDate');
          expect(location).to.be.equal('query');
          expect(messages).to.include(
            '"startDate" must be a number of milliseconds or valid date string'
          );
        });
    });

    it('should not generate report for  timeTrack between a date range of a user logged user has user-manager role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/generate-report`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .query({ startDate: '2018-08-09', endDate: '2018-08-10' })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });
  });

  describe('GET /v1/users/:userId/timeTracks/search', () => {
    /* Create time track entries for jonSnow */
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'you again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
    });
    it('should search timeTracks of a user if it is logged in itself', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ query: '' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(3);
        });
    });

    it('should report error if query is not included in query params', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('query');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"query" is required');
          return Promise.resolve(res);
        });
    });

    it('should list timeTracks of a user if logged in user is super-admin', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ query: '' })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(3);
        });
    });

    it('should not search timeTracks of a user if the logged in user is user-manager', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .query({ query: '' })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body).to.include({ message: 'Forbidden' });
        });
    });

    it('should search all timeTracks with pagination', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ query: 'hi', page: 1, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async res => {
          expect(res.body).to.be.an('object');
          expect(res.body.timeTracks).to.be.an('array');
          expect(res.body.timeTracks).to.have.lengthOf(1);
          expect(res.body.hasPrev).to.be.false;
          expect(res.body.hasNext).to.be.false;
        });
    });

    it("should report error when pagination's parameters are not a number", async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .get(`/v1/users/${userId}/timeTracks/search`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ page: '?', perPage: 'whaat', query: 'hi' })
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then(res => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field[0]).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });

  describe('GET /v1/users/:userId/timeTracks/:timeTrackId', () => {
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'you again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
      timeTrackId = (await TimeTrack.findOne({ userId }))._id;
    });

    it('should get timeTrack', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      return request(app)
        .get(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(res => {
          const formattedTimeTrack = {
            note: 'Hi there',
            date: new Date('2018-08-09').toISOString(),
            duration: 12,
          };
          expect(res.body).to.include(formattedTimeTrack);
        });
    });

    it('should get timeTrack if logged in user is not owner of TimeTrack and is super-admin', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      return request(app)
        .get(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.OK)
        .then(res => {
          const formattedTimeTrack = {
            note: 'Hi there',
            date: new Date('2018-08-09').toISOString(),
            duration: 12,
          };
          expect(res.body).to.include(formattedTimeTrack);
        });
    });
    it('should not get timeTrack if logged user is not owner of Timetrack and is user-admin', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      return request(app)
        .get(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should report error "User does not exist" when user does not exists', () =>
      request(app)
        .get(`/v1/users/56c787ccc67fc16ccc1a5e92/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        }));
  });

  describe('PATCH /v1/users/:userId/timeTracks/:timeTrackId', () => {
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'you again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
      timeTrackId = (await TimeTrack.findOne({ userId }))._id;
    });

    it('should update timeTrack if loggedin user is owner of the timeTrack', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      const timeTrackModified = { note: 'ok yeah', duration: 10.5 };
      return request(app)
        .patch(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .send(timeTrackModified)
        .then(res => {
          expect(res.body).to.include(timeTrackModified);
        });
    });

    it('should update timeTrack if loggedin user is not owner of the timeTrack and has super-admin role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      const timeTrackModified = { note: 'ok yeah', duration: 10.5 };
      return request(app)
        .patch(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.OK)
        .send(timeTrackModified)
        .then(res => {
          expect(res.body).to.include(timeTrackModified);
        });
    });

    it('should not update timeTrack if loggedin user is not owner of the timeTrack and has user-manager role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      const timeTrackModified = { note: 'ok yeah', duration: 10.5 };
      return request(app)
        .patch(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .send(timeTrackModified)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should not update time track when no parameters were given', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      const timeTrackModified = { note: 'ok yeah', duration: 10.5 };
      return request(app)
        .patch(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .send()
        .then(res => {
          expect(res.body).not.to.include(timeTrackModified);
        });
    });

    it('should report error "User does not exist" when user does not exists', () =>
      request(app)
        .patch(`/v1/users/palmeiras191/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        }));

    it('should report error "Timetrack does not exist" when timeTrack does not exists', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .patch(`/v1/users/${userId}/timeTracks/${timeTrackId}1`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.be.equal('TimeTrack does not exist');
        });
    });
  });

  describe('DELETE /v1/users/:userId/timeTracks/:timeTrackId', () => {
    beforeEach(async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;

      await TimeTrack.insertMany([
        { note: 'Hi there', date: '2018-08-09', duration: 12, userId },
        { note: 'you again', date: '2018-08-10', duration: 7, userId },
        { note: 'Is it you?', date: '2018-08-11', duration: 23, userId },
      ]);
      timeTrackId = (await TimeTrack.findOne({ userId }))._id;
    });
    it('should delete timeTrack if logged in user is owner of the timeTrack', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .delete(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() =>
          request(app)
            .get(`/v1/users/${userId}/timeTracks/`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .expect(httpStatus.OK)
            .then(async res => {
              expect(res.body).to.be.an('object');
              expect(res.body.timeTracks).to.be.an('array');
              expect(res.body.timeTracks).to.have.lengthOf(2);
            })
        );
    });

    it('should delete timeTrack if logged in user is not owner of the timeTrack and has super-admin role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .delete(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() =>
          request(app)
            .get(`/v1/users/${userId}/timeTracks/`)
            .set('Authorization', `Bearer ${superAdminAccessToken}`)
            .expect(httpStatus.OK)
            .then(async res => {
              expect(res.body).to.be.an('object');
              expect(res.body.timeTracks).to.be.an('array');
              expect(res.body.timeTracks).to.have.lengthOf(2);
            })
        );
    });

    it('should not delete timeTrack if logged in user is not owner of the timeTrack and has user-admin role', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .delete(`/v1/users/${userId}/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should report error "User does not exist" when user does not exists', () =>
      request(app)
        .delete(`/v1/users/palmeiras1914/timeTracks/${timeTrackId}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        }));

    it('should report error "Timetrack does not exist" when timeTrack does not exists', async () => {
      const userId = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }))._id;
      return request(app)
        .delete(`/v1/users/${userId}/timeTracks/${timeTrackId}1`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.be.equal('TimeTrack does not exist');
        });
    });
  });
});
