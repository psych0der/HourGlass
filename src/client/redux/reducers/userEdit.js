// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';
import { push } from 'react-router-redux';
import pickBy from 'lodash.pickby';
import identity from 'lodash.identity';

export const USER_EDIT_IN_PROGRESS = 'HOURGLASS/USER_EDIT_IN_PROGRESS';
export const RESET_USER_EDIT_STATE = 'HOURGLASS/RESET_USER_EDIT_STATE';
export const USER_EDIT_SUCCESS = 'HOURGLASS/USER_EDIT_SUCCESS';
export const USER_EDIT_FAILED = 'HOURGLASS/USER_EDIT_FAILED';

const initialState = {
  status: IDLE,
  error: null,
};
type State = {
  status: string,
  error: object | null,
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
 */
export const editUser = ({
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
}) => (dispatch: Dispatch) => {
  const sanitized_data = pickBy(
    { email, password, name, role, preferredWorkingHourPerDay },
    identity
  );
  return dispatch({
    types: [USER_EDIT_IN_PROGRESS, USER_EDIT_SUCCESS, USER_EDIT_FAILED],
    promise: () =>
      axios({
        method: 'PATCH',
        url: `http://${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
        data: sanitized_data,
      })
        .then(() => {
          dispatch(push(targetLocation + '?edit=successful'));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
