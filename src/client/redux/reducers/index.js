import { combineReducers } from 'redux';

import register from './register';
import auth from './auth';
import userInfo from './userInfo';
import userEdit from './userEdit';
import listUsers from './listUsers';

export default combineReducers({
  register,
  auth,
  userInfo,
  userEdit,
  listUsers,
});
