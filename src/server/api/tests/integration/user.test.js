/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
/* user bluebird promises */
Promise = require('bluebird');

const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../config/express');
const mongoose = require('../../../config/mongoose');
const User = require('../../models/User');
const { SUPER_ADMIN, USER_MANAGER } = require('../../middlewares/auth');
const JWT_EXPIRATION = require('../../../config/vars').jwtExpirationInterval;

/**
 * root level hooks
 */

async function format(user) {
  const formated = user;

  // delete password
  delete formated.password;

  // get users from database
  const dbUser = (await User.findOne({ email: user.email })).transform();

  // remove null and undefined properties
  return omitBy(dbUser, isNil);
}

describe('Users API', () => {
  let superAdminAccessToken;
  let userManagerAccessToken;
  let userAccessToken;
  let dbUsers;
  let user;
  let superAdmin;
  let userManager;

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
      branTargerian: {
        email: 'brantargerian@gmail.com',
        password: passwordHashed,
        name: 'Bran Targerian',
        role: USER_MANAGER,
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

    user = {
      email: 'sousa.dfs@gmail.com',
      password,
      name: 'Daniel Sousa',
    };

    superAdmin = {
      email: 'galgadot@gmail.com',
      password,
      name: 'Gal gadot',
      role: SUPER_ADMIN,
    };

    userManager = {
      email: 'blakemann@gmail.com',
      password,
      name: 'Blake mann',
      role: USER_MANAGER,
    };

    await User.remove({});
    await User.insertMany([
      dbUsers.branStark,
      dbUsers.branTargerian,
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

  describe('POST /v1/users', async () => {
    it('should create a new user when request is ok and creator is super-admin', () => {
      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(superAdmin)
        .expect(httpStatus.CREATED)
        .then(res => {
          delete superAdmin.password;
          expect(res.body).to.include(superAdmin);
        });
    });

    it('should create a new user when request is ok and creator is user-manager', () => {
      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .send(userManager)
        .expect(httpStatus.CREATED)
        .then(res => {
          delete userManager.password;
          expect(res.body).to.include(userManager);
        });
    });

    it('should create a new user and set default role to "user"', () => {
      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .send(user)
        .expect(httpStatus.CREATED)
        .then(res => {
          expect(res.body.role).to.be.equal('user');
        });
    });

    it('should report error when email already exists', () => {
      user.email = dbUsers.branStark.email;

      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(user)
        .expect(httpStatus.CONFLICT)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" already exists');
        });
    });

    it('should report error when email is not provided', () => {
      delete user.email;

      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('email');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"email" is required');
        });
    });

    it('should report error when password length is less than 6', () => {
      user.password = '12345';

      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field[0]).to.be.equal('password');
          expect(location).to.be.equal('body');
          expect(messages).to.include(
            '"password" length must be at least 6 characters long'
          );
        });
    });

    it('should report error when logged user is not an admin', () => {
      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(user)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/users', () => {
    it('should get all users when logged in user is super-admin', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.OK)
        .then(async res => {
          const bran = await format(dbUsers.branStark);
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          res.body.users[2].createdAt = new Date(res.body.users[2].createdAt);
          const includesBranStark = some(res.body.users, bran);
          const includesjonSnow = some(res.body.users, john);

          expect(res.body).to.be.an('object');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(4);
          expect(includesBranStark).to.be.true;
          expect(includesjonSnow).to.be.true;
        });
    });

    it('should get all users when logged in users is user-manager', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.OK)
        .then(async res => {
          const bran = await format(dbUsers.branStark);
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          res.body.users[2].createdAt = new Date(res.body.users[2].createdAt);
          const includesBranStark = some(res.body.users, bran);
          const includesjonSnow = some(res.body.users, john);

          expect(res.body).to.be.an('object');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(4);
          expect(includesBranStark).to.be.true;
          expect(includesjonSnow).to.be.true;
        });
    });

    it('should get all users with pagination', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ page: 3, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async res => {
          delete dbUsers.jonSnow.password;
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          const includesjonSnow = some(res.body.users, john);
          expect(res.body).to.have.keys('hasNext', 'hasPrev', 'users', 'pages');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(1);
          expect(includesjonSnow).to.be.true;
        });
    });

    it('should filter users', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ email: dbUsers.jonSnow.email })
        .expect(httpStatus.OK)
        .then(async res => {
          delete dbUsers.jonSnow.password;
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          const includesjonSnow = some(res.body.users, john);

          expect(res.body).to.have.keys('hasNext', 'hasPrev', 'users', 'pages');
          expect(res.body.hasNext).to.be.equal(false);
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(1);
          expect(includesjonSnow).to.be.true;
        });
    });

    it("should report error when pagination's parameters are not a number", () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
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

    it('should report error if logged user is not an admin or a user manager', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/users/search', () => {
    it('should search users when logged in user is super-admin', () => {
      return request(app)
        .get('/v1/users/search')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ query: 'bran' })
        .expect(httpStatus.OK)
        .then(async res => {
          const bran = await format(dbUsers.branStark);
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          const includesBranStark = some(res.body.users, bran);
          const includesjonSnow = some(res.body.users, john);

          expect(res.body).to.be.an('object');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(2);
          expect(includesBranStark).to.be.true;
          expect(includesjonSnow).to.be.false;
        });
    });

    it('should search users when logged in user is user-manager', () => {
      return request(app)
        .get('/v1/users/search')
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .query({ query: 'bran' })
        .expect(httpStatus.OK)
        .then(async res => {
          const bran = await format(dbUsers.branStark);
          const john = await format(dbUsers.jonSnow);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);

          const includesBranStark = some(res.body.users, bran);
          const includesjonSnow = some(res.body.users, john);

          expect(res.body).to.be.an('object');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(2);
          expect(includesBranStark).to.be.true;
          expect(includesjonSnow).to.be.false;
        });
    });

    it('should not search users when logged in user is is normal user', () => {
      return request(app)
        .get('/v1/users/search')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ query: 'bran' })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should search all users with pagination', () => {
      return request(app)
        .get('/v1/users/search')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ page: 2, perPage: 1, query: 'bran' })
        .expect(httpStatus.OK)
        .then(async res => {
          delete dbUsers.jonSnow.password;
          const branT = await format(dbUsers.branTargerian);

          // before comparing it is necessary to convert String to Date
          res.body.users[0].createdAt = new Date(res.body.users[0].createdAt);
          const includesBranTargerian = some(res.body.users, branT);

          expect(res.body).to.have.keys('hasNext', 'hasPrev', 'users', 'pages');
          expect(res.body.users).to.be.an('array');
          expect(res.body.users).to.have.lengthOf(1);
          expect(includesBranTargerian).to.be.true;
        });
    });

    it("should report error when pagination's parameters are not a number", () => {
      return request(app)
        .get('/v1/users/search')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .query({ page: '?', perPage: 'whaat', query: 'bran' })
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

  describe('GET /v1/users/:userId', () => {
    it('should get user', async () => {
      const id = (await User.findOne({}))._id;
      delete dbUsers.branStark.password;

      return request(app)
        .get(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(dbUsers.branStark);
        });
    });

    it('should report error "User does not exist" when user does not exists', () => {
      return request(app)
        .get('/v1/users/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        });
    });

    it('should report error "User does not exist" when id is not a valid ObjectID', () => {
      return request(app)
        .get('/v1/users/palmeiras1914')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.equal('User does not exist');
        });
    });

    it('should report error when logged user is not the same as the requested one', async () => {
      const id = (await User.findOne({ email: dbUsers.branStark.email }))._id;

      return request(app)
        .get(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    it('should update user', async () => {
      delete dbUsers.branStark.password;
      const id = (await User.findOne(dbUsers.branStark))._id;
      const { name } = user;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ name })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.name).to.be.equal(name);
          expect(res.body.email).to.be.equal(dbUsers.branStark.email);
        });
    });

    it('should not update user when no parameters were given', async () => {
      delete dbUsers.branStark.password;
      const id = (await User.findOne(dbUsers.branStark))._id;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(dbUsers.branStark);
        });
    });

    it('should report error "User does not exist" when user does not exists', () => {
      return request(app)
        .patch('/v1/users/palmeiras1914')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        });
    });

    it('should report error when logged user is not the same as the requested one', async () => {
      const id = (await User.findOne({ email: dbUsers.branStark.email }))._id;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });

    it('should  update the role of the user to super-admin if logged in user is super-admin', async () => {
      const id = (await User.findOne({ email: dbUsers.jonSnow.email }))._id;
      const role = SUPER_ADMIN;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .send({ role })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.role).to.be.equal(role);
        });
    });

    it('should not update the role of the user (not admin)', async () => {
      const id = (await User.findOne({ email: dbUsers.jonSnow.email }))._id;
      const role = SUPER_ADMIN;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ role })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.role).to.not.be.equal(role);
        });
    });

    it('should not update the role of the user to super-admin if logged in user is not super-admin', async () => {
      const id = (await User.findOne({ email: dbUsers.jonSnow.email }))._id;
      const role = SUPER_ADMIN;

      return request(app)
        .patch(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .send({ role })
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.role).to.not.be.equal(role);
        });
    });
  });

  describe('DELETE /v1/users', () => {
    it('should delete user if logged in user is super-admin', async () => {
      const id = (await User.findOne({}))._id;

      return request(app)
        .delete(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/users'))
        .then(async () => {
          const users = await User.find({});
          expect(users).to.have.lengthOf(3);
        });
    });

    it('should delete user if logged in user is user-manager', async () => {
      const id = (await User.findOne({}))._id;

      return request(app)
        .delete(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/users'))
        .then(async () => {
          const users = await User.find({});
          expect(users).to.have.lengthOf(3);
        });
    });

    it('should not allow deleting itself if the logged in user is not super-admin or user-manager', async () => {
      const id = (await User.findOne({ email: dbUsers.jonSnow.email }))._id;

      return request(app)
        .delete(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(() => request(app).get('/v1/users'))
        .then(async () => {
          const users = await User.find({});
          expect(users).to.have.lengthOf(4);
        });
    });

    it('should report error "User does not exist" when user does not exists', () => {
      return request(app)
        .delete('/v1/users/palmeiras1914')
        .set('Authorization', `Bearer ${superAdminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('User does not exist');
        });
    });

    it('should report error when logged user is not the same as the requested one', async () => {
      const id = (await User.findOne({ email: dbUsers.branStark.email }))._id;

      return request(app)
        .delete(`/v1/users/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.FORBIDDEN)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/users/profile', () => {
    it("should get the logged user's info", () => {
      delete dbUsers.tyrionLanister.password;
      return request(app)
        .get('/v1/users/profile')
        .set('Authorization', `Bearer ${userManagerAccessToken}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.include(dbUsers.tyrionLanister);
        });
    });

    it('should report error without stacktrace when accessToken is expired', async () => {
      // fake time
      const clock = sinon.useFakeTimers();
      const expiredAccessToken = (await User.findAndGenerateToken(
        dbUsers.branStark
      )).accessToken;

      // move clock forward by minutes set in config + 1 minute
      clock.tick(JWT_EXPIRATION * 60000 + 60000);

      return request(app)
        .get('/v1/users/profile')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then(res => {
          expect(res.body.code).to.be.equal(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.be.equal('jwt expired');
          expect(res.body).to.not.have.a.property('stack');
        });
    });
  });
});
