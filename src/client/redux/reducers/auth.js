// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';

export const AUTH_IN_PROGRESS = 'HOURGLASS/AUTH_IN_PROGRESS';
export const AUTH_BLANK_STATE = 'HOURGLASS/AUTH_BLANK_STATE';
export const AUTH_SUCCESS = 'HOURGLASS/AUTH_SUCCESS';
export const AUTH_FAILED = 'HOURGLASS/AUTH_FAILED';
export const SET_USER = 'HOURGLASS/AUTH_SET_USER';
export const UPDATE_PROFILE_IN_PROGRESS =
  'HOURGLASS/UPDATE_PROFILE_IN_PROGRESS';
export const UPDATE_PROFILE_SUCCESS = 'HOURGLASS/UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_FAILURE = 'HOURGLASS/UPDATE_PROFILE_FAILURE';

const initialState = {
  status: IDLE,
  error: null,
  user: null,
  updateProfileStatus: IDLE,
  updateProfileError: null,
};
type State = {
  status: string,
  error: Object | null,
  user: Object | null,
  updateProfileError: Object | null,
  updateProfileStatus: string,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case AUTH_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
        user: null,
      };

    case AUTH_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
        user: action.result,
      };

    case AUTH_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
        user: null,
      };

    case SET_USER:
      return {
        ...state,
        state: IDLE,
        user: action.user,
        error: null,
      };
    case AUTH_BLANK_STATE:
      return initialState;

    case UPDATE_PROFILE_IN_PROGRESS:
      return {
        ...state,
        updateProfileStatus: IN_PROGRESS,
        updateProfileError: null,
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        updateProfileStatus: SUCCESS,
        updateProfileError: null,
        user: {
          ...state.user,
          ...action.result,
        },
      };
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        updateProfileStatus: FAILED,
        updateProfileError: action.error.toString(),
      };

    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: AUTH_BLANK_STATE,
  };
};

export const logout = () => {
  localStorage.removeItem('user');
  return {
    type: AUTH_BLANK_STATE,
  };
};

export const setCurrentUser = (userObj: object) => {
  return {
    type: SET_USER,
    user: userObj,
  };
};

/**
 * Login user into system
 * @param {string} email
 * @param {string} password
 */
export const login = ({
  email,
  password,
}: {
  email: string,
  password: string,
}) => (dispatch: Dispatch) => {
  dispatch({
    types: [AUTH_IN_PROGRESS, AUTH_SUCCESS, AUTH_FAILED],
    promise: () =>
      axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/auth/login`,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          email,
          password,
        },
      })
        .then(res => {
          const jwt = res.data.token;
          const userObj = Object.assign(res.data.user, { ...jwt });
          localStorage.setItem('user', JSON.stringify(userObj));
          return userObj;
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};

/**
 * Update profile of the logged in user
 */
export const updateProfile = () => (dispatch: Dispatch) => {
  dispatch({
    types: [
      UPDATE_PROFILE_IN_PROGRESS,
      UPDATE_PROFILE_SUCCESS,
      UPDATE_PROFILE_FAILURE,
    ],
    promise: () =>
      axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/profile`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      })
        .then(res => {
          return res.data;
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
