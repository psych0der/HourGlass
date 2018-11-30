// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';
import { push } from 'react-router-redux';
import pickBy from 'lodash.pickby';
import identity from 'lodash.identity';

export const CREATE_USER_IN_PROGRESS = 'HOURGLASS/CREATE_USER_IN_PROGRESS';
export const RESET_CREATE_USER_STATE = 'HOURGLASS/RESET_CREATE_USER_STATE';
export const CREATE_USER_SUCCESS = 'HOURGLASS/CREATE_USER_SUCCESS';
export const CREATE_USER_FAILED = 'HOURGLASS/CREATE_USER_FAILED';

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
    case CREATE_USER_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case CREATE_USER_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
      };

    case CREATE_USER_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
      };

    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_CREATE_USER_STATE,
  };
};

/**
 * Register user to system
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {number} Preferred working hours
 */
export const createUser = ({
  email,
  password,
  name,
  preferredWorkingHourPerDay,
  role,
}: {
  email: string,
  password: string,
  name: string,
  preferredWorkingHourPerDay: ?number,
  role: ?String,
}) => (dispatch: Dispatch) => {
  const sanitized_data = pickBy(
    { email, password, name, role, preferredWorkingHourPerDay },
    identity
  );
  dispatch({
    types: [CREATE_USER_IN_PROGRESS, CREATE_USER_SUCCESS, CREATE_USER_FAILED],
    promise: () =>
      axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
        data: sanitized_data,
      })
        .then(res => {
          dispatch(push(`/users/${res.data.id}?creation=success`));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
