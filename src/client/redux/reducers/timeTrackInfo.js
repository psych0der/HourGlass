// @flow
/* Reducer for use registration  */
import axios from 'axios';
import { IDLE, IN_PROGRESS, SUCCESS, FAILED } from '../../commons/constants';
import { getNetworkErrorHandler, getAuthToken } from '../../commons/helpers';

export const TIME_TRACK_INFO_IN_PROGRESS =
  'HOURGLASS/TIME_TRACK_INFO_IN_PROGRESS';
export const RESET_TIME_TRACK_INFO_STATE =
  'HOURGLASS/RESET_TIME_TRACK_INFO_STATE';
export const TIME_TRACK_INFO_SUCCESS = 'HOURGLASS/TIME_TRACK_INFO_SUCCESS';
export const TIME_TRACK_INFO_FAILED = 'HOURGLASS/TIME_TRACK_INFO_FAILED';

const initialState = {
  status: IDLE,
  error: null,
};
type State = {
  status: string,
  error: object | null,
  timeTrackInfo: object | null,
};
export default (state: State = initialState, action) => {
  switch (action.type) {
    case TIME_TRACK_INFO_IN_PROGRESS:
      return {
        ...state,
        status: IN_PROGRESS,
        error: null,
        timeTrackInfo: null,
      };

    case TIME_TRACK_INFO_SUCCESS:
      return {
        ...state,
        status: SUCCESS,
        error: null,
        timeTrackInfo: action.result.data,
      };

    case TIME_TRACK_INFO_FAILED:
      return {
        ...state,
        status: FAILED,
        error: action.error.toString(),
        timeTrackInfo: null,
      };
    case RESET_TIME_TRACK_INFO_STATE:
      return initialState;
    default:
      return state;
  }
};

export const resetState = () => (dispatch: Dispatch) => {
  return {
    type: RESET_TIME_TRACK_INFO_STATE,
  };
};

/**
 * Fetch user info from server
 * @param {string} userId
 */
export const fetchTimeTrackInformation = (
  userId: string,
  timeTrackId: string
) => (dispatch: Dispatch) => {
  dispatch({
    types: [
      TIME_TRACK_INFO_IN_PROGRESS,
      TIME_TRACK_INFO_SUCCESS,
      TIME_TRACK_INFO_FAILED,
    ],
    promise: () =>
      axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_HOST}:${
          process.env.REACT_APP_API_PORT
        }/v1/users/${userId}/timeTracks/${timeTrackId}`,
        headers: {
          'content-type': 'application/json',
          authorization: getAuthToken(),
        },
      }).catch(getNetworkErrorHandler(dispatch)),
  });
};
