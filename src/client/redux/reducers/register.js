// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler } from '../../commons/helpers';
import { push } from 'react-router-redux';

export const REGISTER_IN_PROGRESS = 'HOURGLASS/REGISTER_IN_PROGRESS';
export const RESET_REGISTER_STATE = 'HOURGLASS/RESET_REGISTER_STATE';
export const REGISTER_SUCCESS = 'HOURGLASS/REGISTER_SUCCESS';
export const REGISTER_FAILED = 'HOURGLASS/REGISTER_FAILED';

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
    case REGISTER_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
      };

    case REGISTER_FAILED:
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
    type: RESET_REGISTER_STATE,
  };
};

/**
 * Register user to system
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {number} Preferred working hours
 */
export const registerUser = ({
  email,
  password,
  name,
  preferredWorkingHourPerDay,
}: {
  email: string,
  password: string,
  name: string,
  preferredWorkingHourPerDay: ?number,
}) => (dispatch: Dispatch) => {
  dispatch({
    types: [REGISTER_IN_PROGRESS, REGISTER_SUCCESS, REGISTER_FAILED],
    promise: () =>
      axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/auth/register`,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          email,
          name,
          password,
          preferredWorkingHourPerDay,
        },
      })
        .then(() => {
          dispatch(push('/login?registerSuccess=true'));
        })
        .catch(getNetworkErrorHandler(dispatch)),
  });
};
