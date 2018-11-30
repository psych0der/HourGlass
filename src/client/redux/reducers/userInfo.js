// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';

export const USER_INFO_IN_PROGRESS = 'HOURGLASS/USER_INFO_IN_PROGRESS';
export const RESET_USER_INFO_STATE = 'HOURGLASS/RESET_USER_INFO_STATE';
export const USER_INFO_SUCCESS = 'HOURGLASS/USER_INFO_SUCCESS';
export const USER_INFO_FAILED = 'HOURGLASS/USER_INFO_FAILED';

const initialState = {
  status: IDLE,
  error: null,
};
type State = {
  status: string,
  error: object | null,
  userInfo: object | null,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case USER_INFO_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
        userInfo: null,
      };

    case USER_INFO_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
        userInfo: action.result.data,
      };

    case USER_INFO_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
        userInfo: null,
      };
    case RESET_USER_INFO_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_USER_INFO_STATE,
  };
};

/**
 * Fetch user info from server
 * @param {string} userId
 */
export const fetchUserInformation = (userId: string) => (
  dispatch: Dispatch
) => {
  dispatch({
    types: [USER_INFO_IN_PROGRESS, USER_INFO_SUCCESS, USER_INFO_FAILED],
    promise: () =>
      axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      }).catch(getNetworkErrorHandler(dispatch)),
  });
};
