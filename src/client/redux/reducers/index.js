import { combineReducers } from 'redux';

import register from './register';
import auth from './auth';
import userInfo from './userInfo';
import userEdit from './userEdit';

export default combineReducers({ register, auth, userInfo, userEdit });
