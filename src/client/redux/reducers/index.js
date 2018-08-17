import { combineReducers } from 'redux';

import register from './register';
import auth from './auth';
import userInfo from './userInfo';
import userEdit from './userEdit';
import listUsers from './listUsers';
import createUser from './createUser';

export default combineReducers({
  register,
  auth,
  userInfo,
  userEdit,
  listUsers,
  createUser,
});
