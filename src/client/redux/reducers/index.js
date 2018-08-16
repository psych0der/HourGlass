import { combineReducers } from 'redux';

import register from './register';
import auth from './auth';

export default combineReducers({ register, auth });
