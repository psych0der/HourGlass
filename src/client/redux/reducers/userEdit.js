// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';
import { push } from 'react-router-redux';
import pickBy from 'lodash.pickby';
import identity from 'lodash.identity';
import { updateProfile } from './auth';

export const USER_EDIT_IN_PROGRESS = 'HOURGLASS/USER_EDIT_IN_PROGRESS';
export const RESET_USER_EDIT_STATE = 'HOURGLASS/RESET_USER_EDIT_STATE';
export const RESET_USER_DELETE_STATE = 'HOURGLASS/RESET_USER_DELETE_STATE';
export const USER_EDIT_SUCCESS = 'HOURGLASS/USER_EDIT_SUCCESS';
export const USER_EDIT_FAILED = 'HOURGLASS/USER_EDIT_FAILED';

export const USER_DELETE_IN_PROGRESS = 'HOURGLASS/USER_DELETE_IN_PROGRESS';
export const USER_DELETE_SUCCESS = 'HOURGLASS/USER_DELETE_SUCCESS';
export const USER_DELETE_FAILED = 'HOURGLASS/USER_DELETE_FAILED';

const initialState = {
  status: IDLE,
  error: null,
  deleteStatus: IDLE,
  deleteError: null,
};
type State = {
  status: string,
  error: object | null,
  deleteStatus: string,
  deleteError: object | null,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case USER_EDIT_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case USER_EDIT_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
      };

    case USER_EDIT_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
      };

    case USER_DELETE_IN_PROGRESS:
      return {
        ...state,
        deleteStatus: IN_PROGRESS,
        deleteError: null,
      };

    case USER_DELETE_SUCCESS:
      return {
        ...state,
        deleteStatus: SUCCESS,
        deleteError: null,
      };

    case USER_DELETE_FAILED:
      return {
        ...state,
        deleteStatus: FAILED,
        deleteError: action.error.toString(),
      };
    case RESET_USER_DELETE_STATE:
      return {
        ...state,
        deleteStatus: IDLE,
        deleteError: null,
      };
    case RESET_USER_EDIT_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_USER_EDIT_STATE,
  };
};

/**
 * edit user info
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {number} Preferred working hours
 * @param {string} role
 * @param {string} targetLocation
 * @param {string} self signifies if the logged in user is getting updated
 */
export const editUser = (
  {
    userId,
    email,
    password,
    name,
    preferredWorkingHourPerDay,
    role,
    targetLocation,
  }: {
    userId: string,
    email: string,
    password: ?string,
    name: string,
    preferredWorkingHourPerDay: ?number,
    targetLocation: string,
    role: ?string,
  },
  self: boolean = false
) => (dispatch: Dispatch) => {
  const sanitized_data = pickBy(
    { email, password, name, role, preferredWorkingHourPerDay },
    identity
  );
  return dispatch({
    types: [USER_EDIT_IN_PROGRESS, USER_EDIT_SUCCESS, USER_EDIT_FAILED],
    promise: () =>
      axios({
        method: 'PATCH',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
        data: sanitized_data,
      })
        .then(() => {
          if (self) {
            updateProfile()(dispatch);
          }
          dispatch(push(targetLocation + '?edit=successful'));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};

export const deleteUser = (userId: string, targetLocation: string) => (
  dispatch: Dispatch
) => {
  return dispatch({
    types: [USER_EDIT_IN_PROGRESS, USER_EDIT_SUCCESS, USER_EDIT_FAILED],
    promise: () =>
      axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      })
        .then(() => {
          dispatch(push(targetLocation + '?delete=successful'));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
